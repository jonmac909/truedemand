-- C1 Job System Hardening Migration
-- Adds retry management, worker identification, and heartbeat tracking

-- ============================================================
-- Add Retry Management Columns
-- ============================================================

-- Track number of retry attempts for failed jobs
ALTER TABLE jobs ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;

-- Maximum number of retries before permanent failure
ALTER TABLE jobs ADD COLUMN max_retries INTEGER NOT NULL DEFAULT 3;

-- ============================================================
-- Add Worker Identification & Heartbeat Columns
-- ============================================================

-- Identifies which worker instance is processing this job
ALTER TABLE jobs ADD COLUMN worker_id TEXT;

-- Last heartbeat timestamp for detecting stale/crashed workers
ALTER TABLE jobs ADD COLUMN last_heartbeat_at TIMESTAMPTZ;

-- ============================================================
-- Indexes for Performance
-- ============================================================

-- Index for finding stale jobs (jobs with old heartbeats)
CREATE INDEX idx_jobs_stale_detection ON jobs(status, last_heartbeat_at)
  WHERE status = 'running';

-- Index for finding failed jobs eligible for retry
CREATE INDEX idx_jobs_retry_eligible ON jobs(status, retry_count, max_retries)
  WHERE status = 'failed' AND retry_count < max_retries;

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON COLUMN jobs.retry_count IS 'Number of times this job has been retried after failure';
COMMENT ON COLUMN jobs.max_retries IS 'Maximum number of retries before marking as permanently failed';
COMMENT ON COLUMN jobs.worker_id IS 'Unique identifier of the worker processing this job';
COMMENT ON COLUMN jobs.last_heartbeat_at IS 'Last keepalive signal from worker, used to detect stale jobs';
