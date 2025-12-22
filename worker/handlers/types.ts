import type { Job } from '../../lib/db/jobs';

/**
 * Job handler function signature.
 * Handlers receive the full job object and must handle their own progress updates.
 */
export type JobHandler = (job: Job) => Promise<Record<string, any>>;

/**
 * Registry of job handlers by job type.
 */
export type JobHandlerRegistry = {
  [K in Job['job_type']]?: JobHandler;
};
