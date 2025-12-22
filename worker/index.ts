/**
 * TrueDemand Background Job Worker (C1 Hardened)
 *
 * This worker polls the jobs table for pending jobs and processes them asynchronously.
 * It's designed to run in a separate process from the Next.js server.
 *
 * C1 Hardening Features:
 * - Atomic job claiming with worker identification
 * - Heartbeat mechanism for liveness detection
 * - Automatic stale job recovery
 * - Retry logic with exponential backoff
 * - Enhanced error handling with stack traces
 *
 * Run with: npm run worker
 */

import { hostname } from 'os';
import {
  fetchNextPendingJob,
  claimJob,
  markJobAsCompleted,
  markJobAsFailed,
  updateHeartbeat,
  recoverStaleJobs,
  type Job,
} from '../lib/db/jobs';
import { jobHandlers } from './handlers';

// Configuration
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS) || 2000;
const HEARTBEAT_INTERVAL_MS = Number(process.env.WORKER_HEARTBEAT_INTERVAL_MS) || 15000; // 15 seconds
const STALE_JOB_CHECK_INTERVAL_MS = Number(process.env.WORKER_STALE_JOB_CHECK_INTERVAL_MS) || 60000; // 1 minute
const STALE_JOB_THRESHOLD_SECONDS = Number(process.env.WORKER_STALE_JOB_THRESHOLD_SECONDS) || 300; // 5 minutes

// Generate unique worker ID (hostname-pid-random)
const WORKER_ID = `${hostname()}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

let isShuttingDown = false;
let activeJobId: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let staleJobCheckInterval: NodeJS.Timeout | null = null;

/**
 * Main worker loop.
 * Continuously polls for pending jobs and processes them.
 */
async function runWorker() {
  console.log('🚀 TrueDemand worker starting (C1 Hardened)...');
  console.log(`🆔 Worker ID: ${WORKER_ID}`);
  console.log(`📊 Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`💓 Heartbeat interval: ${HEARTBEAT_INTERVAL_MS}ms`);
  console.log(`🔍 Stale job check interval: ${STALE_JOB_CHECK_INTERVAL_MS}ms`);
  console.log(`⏱️  Stale job threshold: ${STALE_JOB_THRESHOLD_SECONDS}s`);
  console.log('');

  // Recover any stale jobs on startup
  console.log('🔧 Checking for stale jobs...');
  const recoveredIds = await recoverStaleJobs(STALE_JOB_THRESHOLD_SECONDS);
  if (recoveredIds.length > 0) {
    console.log(`✅ Recovered ${recoveredIds.length} stale job(s): ${recoveredIds.join(', ')}`);
  } else {
    console.log('✅ No stale jobs found');
  }
  console.log('');

  // Start periodic stale job recovery
  staleJobCheckInterval = setInterval(async () => {
    try {
      const recovered = await recoverStaleJobs(STALE_JOB_THRESHOLD_SECONDS);
      if (recovered.length > 0) {
        console.log(`🔧 Periodic recovery: ${recovered.length} stale job(s) recovered`);
      }
    } catch (error) {
      console.error('❌ Error in periodic stale job recovery:', error);
    }
  }, STALE_JOB_CHECK_INTERVAL_MS);

  while (!isShuttingDown) {
    try {
      await processNextJob();
    } catch (error) {
      console.error('❌ Error in worker loop:', error);
    }

    // Wait before polling again
    await sleep(POLL_INTERVAL_MS);
  }

  // Cleanup intervals
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (staleJobCheckInterval) clearInterval(staleJobCheckInterval);

  console.log('👋 Worker shutting down gracefully');
}

/**
 * Fetch and process the next pending job.
 */
async function processNextJob(): Promise<void> {
  // Fetch next pending job
  const job = await fetchNextPendingJob();

  if (!job) {
    // No pending jobs, wait for next poll
    return;
  }

  console.log(`\n📦 Found job: ${job.id}`);
  console.log(`   Type: ${job.job_type}`);
  console.log(`   Project: ${job.project_id}`);
  console.log(`   Retry: ${job.retry_count}/${job.max_retries}`);

  // Attempt to atomically claim the job
  const claimed = await claimJob(job.id, WORKER_ID);

  if (!claimed) {
    console.log('   ⚠️  Job already claimed by another worker');
    return;
  }

  activeJobId = job.id;
  console.log(`   ✅ Job claimed by ${WORKER_ID}, starting execution...`);

  // Start heartbeat interval
  heartbeatInterval = setInterval(async () => {
    if (activeJobId) {
      try {
        await updateHeartbeat(activeJobId, WORKER_ID);
      } catch (error) {
        console.error('   ⚠️  Failed to update heartbeat:', error);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);

  try {
    // Find the appropriate handler
    const handler = jobHandlers[job.job_type];

    if (!handler) {
      throw new Error(`No handler found for job type: ${job.job_type}`);
    }

    // Execute the handler
    const resultData = await handler(job);

    // Mark job as completed
    await markJobAsCompleted(job.id, resultData);
    console.log(`   ✅ Job completed successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`   ❌ Job failed: ${errorMessage}`);
    if (errorStack) {
      console.error(`   Stack trace: ${errorStack}`);
    }

    // Enhanced error message with stack trace
    const fullErrorMessage = errorStack
      ? `${errorMessage}\n\nStack trace:\n${errorStack}`
      : errorMessage;

    // Determine if error is retryable (default: yes, unless explicitly non-retryable)
    const isRetryable = !errorMessage.toLowerCase().includes('non-retryable') &&
                        !errorMessage.toLowerCase().includes('permanent failure');

    // Mark job as failed (will auto-retry if retries remain)
    await markJobAsFailed(job.id, fullErrorMessage, isRetryable);

    if (isRetryable && job.retry_count < job.max_retries) {
      console.log(`   🔄 Job will be retried (attempt ${job.retry_count + 2}/${job.max_retries})`);
    } else {
      console.log(`   ❌ Job permanently failed`);
    }
  } finally {
    // Stop heartbeat
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    activeJobId = null;
  }
}

/**
 * Graceful shutdown handler.
 * Waits for active job to complete before exiting.
 */
async function handleShutdown(signal: string) {
  console.log(`\n\n🛑 Received ${signal}, initiating graceful shutdown...`);
  isShuttingDown = true;

  if (activeJobId) {
    console.log(`⏳ Waiting for active job ${activeJobId} to complete...`);
    // Wait up to 30 seconds for job to complete
    const maxWait = 30000;
    const checkInterval = 500;
    let waited = 0;

    while (activeJobId && waited < maxWait) {
      await sleep(checkInterval);
      waited += checkInterval;
    }

    if (activeJobId) {
      console.log('⚠️  Job did not complete in time, forcing shutdown');
    } else {
      console.log('✅ Active job completed');
    }
  }

  console.log('👋 Goodbye!');
  process.exit(0);
}

/**
 * Sleep helper.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Register shutdown handlers
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the worker
runWorker().catch((error) => {
  console.error('💥 Fatal error in worker:', error);
  process.exit(1);
});
