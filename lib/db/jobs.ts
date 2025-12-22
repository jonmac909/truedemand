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
 * Mark a job as running and set started_at timestamp.
 * Returns true if successful, false if job was already claimed.
 */
export async function markJobAsRunning(jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
      progress: 0,
    })
    .eq('id', jobId)
    .eq('status', 'pending'); // Only update if still pending (prevents race conditions)

  if (error) {
    console.error('Failed to mark job as running:', error);
    return false;
  }

  return true;
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
 */
export async function markJobAsFailed(
  jobId: string,
  errorMessage: string
): Promise<void> {
  // Fetch current logs to append error
  const { data: currentJob } = await supabase
    .from('jobs')
    .select('logs')
    .eq('id', jobId)
    .single();

  const currentLogs = (currentJob?.logs as string[]) || [];
  const timestamp = new Date().toISOString();
  const errorLog = `[${timestamp}] ERROR: ${errorMessage}`;

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
      logs: [...currentLogs, errorLog],
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to mark job as failed:', error);
    throw error;
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
