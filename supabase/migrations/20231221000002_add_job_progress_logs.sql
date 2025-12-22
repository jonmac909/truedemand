-- Add progress tracking and logs to jobs table
-- Required for real-time job status updates in UI

ALTER TABLE jobs ADD COLUMN progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
ALTER TABLE jobs ADD COLUMN logs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add mock_job type for testing
ALTER TABLE jobs DROP CONSTRAINT jobs_job_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_job_type_check CHECK (job_type IN (
  'sub_niche_discovery',
  'validation',
  'idea_generation',
  'blueprint_creation',
  'mock_job'
));

COMMENT ON COLUMN jobs.progress IS 'Job completion percentage (0-100)';
COMMENT ON COLUMN jobs.logs IS 'Timestamped log entries from job execution';
