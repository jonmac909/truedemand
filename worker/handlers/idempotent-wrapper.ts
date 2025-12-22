import type { Job } from '../../lib/db/jobs';
import { getJobById } from '../../lib/db/jobs';
import type { JobHandler } from './types';

/**
 * Idempotent Job Handler Wrapper (C1)
 *
 * Ensures job handlers are idempotent by:
 * 1. Checking if job already has result_data (already completed)
 * 2. If yes, returns cached result without re-execution
 * 3. If no, executes handler normally
 *
 * This prevents duplicate execution if a job is re-claimed after:
 * - Worker crash during completion
 * - Network interruption
 * - Database timeout
 *
 * Application-level idempotency uses job_id as the natural idempotency key.
 */
export function makeIdempotent(handler: JobHandler): JobHandler {
  return async (job: Job): Promise<Record<string, any>> => {
    // Check if job already has result_data (already completed)
    // This can happen if:
    // - Job completed but worker crashed before marking as completed
    // - Job marked completed but network interrupted
    // - Stale job recovery triggered on already-completed job
    if (job.result_data && Object.keys(job.result_data).length > 0) {
      console.log(`   ⚡ Job ${job.id} already has result_data, returning cached result (idempotent)`);
      return job.result_data;
    }

    // Fetch latest job state from database to double-check
    // (in case in-memory job object is stale)
    const latestJob = await getJobById(job.id);

    if (!latestJob) {
      throw new Error(`Job ${job.id} not found in database`);
    }

    // If latest job already completed, return its result
    if (latestJob.status === 'completed' && latestJob.result_data) {
      console.log(`   ⚡ Job ${job.id} already completed in database, returning cached result (idempotent)`);
      return latestJob.result_data;
    }

    // No cached result - execute handler normally
    return await handler(latestJob);
  };
}
