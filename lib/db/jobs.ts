import { supabase } from '../supabase/client';

export type JobType =
  | 'sub_niche_discovery'
  | 'validation'
  | 'idea_generation'
  | 'blueprint_creation'
  | 'mock_job';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  project_id: string;
  job_type: JobType;
  status: JobStatus;
  input_data: Record<string, any>;
  result_data: Record<string, any> | null;
  error_message: string | null;
  progress: number;
  logs: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  retry_count: number;
  max_retries: number;
  worker_id: string | null;
  last_heartbeat_at: string | null;
}

export interface CreateJobParams {
  project_id: string;
  job_type: JobType;
  input_data: Record<string, any>;
}

/**
 * Fetch next pending job to process (FIFO order).
 * Returns null if no pending jobs exist.
 */
export async function fetchNextPendingJob(): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data as Job;
}

/**
 * Atomically claim a job for processing by a specific worker.
 * This is the ONLY safe way to claim a job in a multi-worker environment.
 *
 * @param jobId - Job to claim
 * @param workerId - Unique identifier for this worker instance
 * @returns true if successfully claimed, false if already claimed
 */
export async function claimJob(jobId: string, workerId: string): Promise<boolean> {
  const now = new Date().toISOString();

  // Atomic update: only succeed if job is still pending
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'running',
      worker_id: workerId,
      started_at: now,
      last_heartbeat_at: now,
      progress: 0,
    })
    .eq('id', jobId)
    .eq('status', 'pending') // Critical: only claim if still pending
    .select('id');

  if (error) {
    console.error('Failed to claim job:', error);
    return false;
  }

  // If no rows were updated, job was already claimed
  return data && data.length > 0;
}

/**
 * DEPRECATED: Use claimJob() instead for atomic claiming with worker identification.
 * This function is kept for backwards compatibility only.
 */
export async function markJobAsRunning(jobId: string): Promise<boolean> {
  console.warn('⚠️  markJobAsRunning is deprecated, use claimJob(jobId, workerId) instead');
  return claimJob(jobId, 'legacy-worker');
}

/**
 * Update job progress (0-100) and append log entry.
 */
export async function updateJobProgress(
  jobId: string,
  progress: number,
  logMessage: string
): Promise<void> {
  // Fetch current logs
  const { data: currentJob } = await supabase
    .from('jobs')
    .select('logs')
    .eq('id', jobId)
    .single();

  const currentLogs = (currentJob?.logs as string[]) || [];
  const timestamp = new Date().toISOString();
  const newLog = `[${timestamp}] ${logMessage}`;

  const { error } = await supabase
    .from('jobs')
    .update({
      progress: Math.min(100, Math.max(0, progress)),
      logs: [...currentLogs, newLog],
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to update job progress:', error);
    throw error;
  }
}

/**
 * Mark job as completed with result data.
 */
export async function markJobAsCompleted(
  jobId: string,
  resultData: Record<string, any>
): Promise<void> {
  // Fetch current logs to append final message
  const { data: currentJob } = await supabase
    .from('jobs')
    .select('logs')
    .eq('id', jobId)
    .single();

  const currentLogs = (currentJob?.logs as string[]) || [];
  const timestamp = new Date().toISOString();
  const finalLog = `[${timestamp}] Job completed successfully`;

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'completed',
      progress: 100,
      result_data: resultData,
      completed_at: new Date().toISOString(),
      logs: [...currentLogs, finalLog],
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to mark job as completed:', error);
    throw error;
  }
}

/**
 * Mark job as failed with error message.
 * Automatically increments retry_count and resets to pending if retries remain.
 *
 * @param jobId - Job to mark as failed
 * @param errorMessage - Error details
 * @param isRetryable - Whether this failure can be retried (default: true)
 */
export async function markJobAsFailed(
  jobId: string,
  errorMessage: string,
  isRetryable: boolean = true
): Promise<void> {
  // Fetch current job state
  const { data: currentJob } = await supabase
    .from('jobs')
    .select('logs, retry_count, max_retries')
    .eq('id', jobId)
    .single();

  if (!currentJob) {
    throw new Error(`Job ${jobId} not found`);
  }

  const currentLogs = (currentJob.logs as string[]) || [];
  const timestamp = new Date().toISOString();
  const retryCount = currentJob.retry_count || 0;
  const maxRetries = currentJob.max_retries || 3;

  // Determine if we should retry
  const canRetry = isRetryable && retryCount < maxRetries;

  if (canRetry) {
    // Retry available - increment retry_count and reset to pending
    const retryLog = `[${timestamp}] ERROR (attempt ${retryCount + 1}/${maxRetries}): ${errorMessage}`;
    const retryQueuedLog = `[${timestamp}] Job queued for retry (attempt ${retryCount + 2}/${maxRetries})`;

    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'pending', // Reset to pending for retry
        error_message: errorMessage,
        retry_count: retryCount + 1,
        worker_id: null, // Clear worker assignment
        last_heartbeat_at: null,
        progress: 0,
        logs: [...currentLogs, retryLog, retryQueuedLog],
      })
      .eq('id', jobId);

    if (error) {
      console.error('Failed to queue job for retry:', error);
      throw error;
    }
  } else {
    // No retries left or not retryable - mark as permanently failed
    const errorLog = `[${timestamp}] FATAL ERROR: ${errorMessage}`;
    const failureLog = `[${timestamp}] Job permanently failed after ${retryCount} ${retryCount === 1 ? 'retry' : 'retries'}`;

    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        logs: [...currentLogs, errorLog, failureLog],
      })
      .eq('id', jobId);

    if (error) {
      console.error('Failed to mark job as permanently failed:', error);
      throw error;
    }
  }
}

/**
 * Create a new job in pending state.
 */
export async function createJob(params: CreateJobParams): Promise<Job> {
  const timestamp = new Date().toISOString();
  const initialLog = `[${timestamp}] Job created and queued`;

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      project_id: params.project_id,
      job_type: params.job_type,
      status: 'pending',
      input_data: params.input_data,
      progress: 0,
      logs: [initialLog],
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create job:', error);
    throw error;
  }

  return data as Job;
}

/**
 * Get job by ID.
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Job;
}

/**
 * Update the heartbeat timestamp for a running job.
 * This signals that the worker is still alive and processing the job.
 *
 * Should be called periodically (every 10-30 seconds) during job execution.
 *
 * @param jobId - Job to update
 * @param workerId - Worker that owns this job
 */
export async function updateHeartbeat(jobId: string, workerId: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .update({
      last_heartbeat_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('worker_id', workerId) // Only update if we own the job
    .eq('status', 'running');

  if (error) {
    console.error('Failed to update heartbeat:', error);
    throw error;
  }
}

/**
 * Detect and recover stale jobs (jobs with old heartbeats).
 * Stale jobs indicate a worker crashed or died without completing the job.
 *
 * This function finds running jobs whose last_heartbeat_at is older than
 * the threshold and resets them to pending for retry.
 *
 * @param staleThresholdSeconds - Jobs with heartbeats older than this are considered stale (default: 300 = 5 minutes)
 * @returns Array of recovered job IDs
 */
export async function recoverStaleJobs(staleThresholdSeconds: number = 300): Promise<string[]> {
  const thresholdTime = new Date(Date.now() - staleThresholdSeconds * 1000).toISOString();

  // Find stale jobs: running jobs with old heartbeats
  const { data: staleJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('id, job_type, worker_id, logs')
    .eq('status', 'running')
    .lt('last_heartbeat_at', thresholdTime);

  if (fetchError) {
    console.error('Failed to fetch stale jobs:', fetchError);
    return [];
  }

  if (!staleJobs || staleJobs.length === 0) {
    return [];
  }

  const recoveredIds: string[] = [];
  const timestamp = new Date().toISOString();

  for (const job of staleJobs) {
    const currentLogs = (job.logs as string[]) || [];
    const recoveryLog = `[${timestamp}] Job stale (worker ${job.worker_id} unresponsive), resetting to pending for retry`;

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'pending',
        worker_id: null,
        last_heartbeat_at: null,
        progress: 0,
        logs: [...currentLogs, recoveryLog],
      })
      .eq('id', job.id)
      .eq('status', 'running'); // Only reset if still running (double-check)

    if (!updateError) {
      recoveredIds.push(job.id);
      console.log(`✅ Recovered stale job ${job.id} (type: ${job.job_type}, worker: ${job.worker_id})`);
    } else {
      console.error(`Failed to recover stale job ${job.id}:`, updateError);
    }
  }

  return recoveredIds;
}
