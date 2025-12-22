/**
 * TrueDemand Background Job Worker
 *
 * This worker polls the jobs table for pending jobs and processes them asynchronously.
 * It's designed to run in a separate process from the Next.js server.
 *
 * Run with: npm run worker
 */

import {
  fetchNextPendingJob,
  markJobAsRunning,
  markJobAsCompleted,
  markJobAsFailed,
  type Job,
} from '../lib/db/jobs';
import { jobHandlers } from './handlers';

// Configuration
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS) || 2000;
const MAX_RETRIES = 3;

let isShuttingDown = false;
let activeJobId: string | null = null;

/**
 * Main worker loop.
 * Continuously polls for pending jobs and processes them.
 */
async function runWorker() {
  console.log('🚀 TrueDemand worker starting...');
  console.log(`📊 Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`🔄 Max retries: ${MAX_RETRIES}`);
  console.log('');

  while (!isShuttingDown) {
    try {
      await processNextJob();
    } catch (error) {
      console.error('❌ Error in worker loop:', error);
    }

    // Wait before polling again
    await sleep(POLL_INTERVAL_MS);
  }

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

  // Attempt to claim the job
  const claimed = await markJobAsRunning(job.id);

  if (!claimed) {
    console.log('   ⚠️  Job already claimed by another worker');
    return;
  }

  activeJobId = job.id;
  console.log('   ✅ Job claimed, starting execution...');

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
    console.error(`   ❌ Job failed: ${errorMessage}`);

    // Mark job as failed
    await markJobAsFailed(job.id, errorMessage);
  } finally {
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
