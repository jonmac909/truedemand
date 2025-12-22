# TrueDemand Background Worker

The worker process handles asynchronous job execution for TrueDemand. It runs independently from the Next.js server and polls the `jobs` table for pending work.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│  Next.js    │────────▶│  Supabase    │◀────────│   Worker    │
│  API Routes │  Write  │  jobs table  │  Poll   │   Process   │
│             │  Jobs   │              │  Jobs   │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Job Lifecycle

1. **Created**: API route creates job with status `pending`
2. **Claimed**: Worker fetches and marks job as `running`
3. **Processing**: Handler executes, updating `progress` (0-100) and `logs`
4. **Completed**: Job marked as `completed` with `result_data`
5. **Failed**: On error, job marked as `failed` with `error_message`

## Running the Worker

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (copy `.env.example` to `.env`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   WORKER_POLL_INTERVAL_MS=2000
   ```

### Development

Run the worker with auto-reload on file changes:

```bash
npm run worker
```

### Production

Run the worker once without watch mode:

```bash
npm run worker:once
```

## Configuration

- `WORKER_POLL_INTERVAL_MS`: Time between job polls (default: 2000ms)
- Worker automatically handles graceful shutdown on `SIGINT`/`SIGTERM`

## Job Handlers

Handlers are defined in `worker/handlers/`. Each handler:

- Receives a `Job` object with `input_data`
- Updates progress using `updateJobProgress(jobId, progress, logMessage)`
- Returns `result_data` object on success
- Throws errors that get caught and stored as `error_message`

### Available Handlers

- **`mock_job`**: Demo handler that simulates work with progress updates

### Adding New Handlers

1. Create handler file in `worker/handlers/`
2. Export handler function matching `JobHandler` type
3. Register in `worker/handlers/index.ts`

Example:

```typescript
// worker/handlers/my-job.ts
import type { Job } from '../../lib/db/jobs';
import { updateJobProgress } from '../../lib/db/jobs';

export async function handleMyJob(job: Job): Promise<Record<string, any>> {
  await updateJobProgress(job.id, 0, 'Starting my job');

  // Do work...

  await updateJobProgress(job.id, 50, 'Halfway done');

  // More work...

  return { success: true, data: 'result' };
}
```

```typescript
// worker/handlers/index.ts
import { handleMyJob } from './my-job';

export const jobHandlers: JobHandlerRegistry = {
  my_job: handleMyJob,
  // ...
};
```

## Restart Safety

The worker is designed to be restart-safe:

- Jobs are claimed atomically using database transactions
- If worker crashes, jobs in `running` state can be manually reset to `pending`
- Multiple workers can run concurrently (though not required for v1)

## Monitoring

Monitor jobs via Supabase dashboard or direct queries:

```sql
-- View active jobs
SELECT id, job_type, status, progress, created_at
FROM jobs
WHERE status IN ('pending', 'running')
ORDER BY created_at DESC;

-- View recent logs for a job
SELECT logs FROM jobs WHERE id = 'job-id-here';
```

## Troubleshooting

### Worker not picking up jobs

1. Verify `.env` file has correct `SUPABASE_SERVICE_ROLE_KEY`
2. Check job status is `pending` (not `running` or `completed`)
3. Verify worker is connected to correct Supabase project

### Job stuck in "running" state

If worker crashes during job execution, manually reset:

```sql
UPDATE jobs
SET status = 'pending', started_at = NULL, progress = 0
WHERE id = 'stuck-job-id';
```

### Missing handler error

Ensure job type is registered in `worker/handlers/index.ts` and matches the `job_type` constraint in the database.
