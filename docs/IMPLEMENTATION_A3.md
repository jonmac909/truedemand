# A3: Background Job System Implementation

## Summary

Implemented a fully functional async background job system with worker polling loop, job lifecycle management, and progress tracking.

## Architecture

### Job Lifecycle

```
pending → running → completed
                 └→ failed
```

1. **pending**: Job created and queued
2. **running**: Worker claimed and is processing
3. **completed**: Successfully finished with result_data
4. **failed**: Error occurred, stored in error_message

### System Components

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Next.js App    │────────▶│  Supabase        │◀────────│  Worker         │
│  (Future: UI)   │ Create  │  jobs table      │  Poll   │  Process        │
│                 │ Jobs    │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                    │
                                    │ Store:
                                    │ - status
                                    │ - progress (0-100)
                                    │ - logs[]
                                    │ - result_data
                                    │ - error_message
```

## Files Created

### Database

**`supabase/migrations/20231221000002_add_job_progress_logs.sql`**
- Added `progress` column (0-100 integer)
- Added `logs` column (text array for timestamped entries)
- Added `mock_job` job type for testing

### Core Libraries

**`lib/supabase/client.ts`**
- Supabase client with service role key
- Used by worker for admin access to all tables

**`lib/db/jobs.ts`**
- `fetchNextPendingJob()` - Poll for work (FIFO)
- `markJobAsRunning()` - Atomic claim with race condition protection
- `updateJobProgress()` - Update progress % and append log
- `markJobAsCompleted()` - Store result_data
- `markJobAsFailed()` - Store error_message
- `createJob()` - Create new pending job
- `getJobById()` - Fetch job by ID

### Worker System

**`worker/index.ts`** - Main polling loop
- Polls every 2 seconds (configurable via env)
- Claims jobs atomically
- Executes appropriate handler
- Handles errors gracefully
- Graceful shutdown on SIGINT/SIGTERM
- Restart-safe design

**`worker/handlers/types.ts`** - Type definitions
- `JobHandler` function signature
- `JobHandlerRegistry` type

**`worker/handlers/mock-job.ts`** - Demo handler
- Simulates 5-step process with delays
- Updates progress from 0 → 100
- Logs each step with timestamps
- Returns mock result data
- Total execution time: ~6.5 seconds

**`worker/handlers/index.ts`** - Handler registry
- Maps job types to handlers
- Currently includes `mock_job`
- Placeholder comments for future handlers

### Configuration

**`package.json`**
- Dependencies: Next.js, React, Supabase, TypeScript
- Scripts:
  - `npm run dev` - Next.js dev server
  - `npm run worker` - Worker with auto-reload
  - `npm run worker:once` - Worker single run

**`tsconfig.json`**
- TypeScript config for Next.js + worker
- Strict mode enabled
- Path aliases configured

**`.env.example`**
- Supabase URL and keys
- Worker poll interval configuration

**`.gitignore`**
- Standard Node.js/Next.js patterns
- Environment files excluded
- Build artifacts excluded

### Documentation

**`worker/README.md`** - Comprehensive worker documentation
- Architecture diagrams
- Setup instructions
- Job lifecycle details
- Handler development guide
- Troubleshooting section

**`README.md`** - Project-level documentation
- Quick start guide
- Architecture overview
- Project structure
- Development workflow

### Minimal Next.js Setup

**`next.config.js`** - Next.js configuration
**`tailwind.config.ts`** - Tailwind CSS config
**`postcss.config.js`** - PostCSS config
**`app/layout.tsx`** - Root layout
**`app/page.tsx`** - Placeholder home page
**`app/globals.css`** - Global styles with Tailwind

## Key Features

### 1. Atomic Job Claiming
Worker uses optimistic locking to prevent race conditions:
```sql
UPDATE jobs SET status = 'running'
WHERE id = ? AND status = 'pending'
```

### 2. Progress Tracking
Jobs can report 0-100 progress with descriptive log messages:
```typescript
await updateJobProgress(job.id, 50, 'Halfway through analysis');
```

### 3. Restart Safety
- Worker can be stopped/started without data loss
- Jobs in `running` state can be manually reset if worker crashes
- No in-memory state required

### 4. Graceful Shutdown
- Listens for SIGINT/SIGTERM
- Waits up to 30s for active job to complete
- Prevents partial job execution

### 5. Structured Logging
All job operations append timestamped logs to database:
```
[2024-12-21T16:39:00.000Z] Job created and queued
[2024-12-21T16:39:02.000Z] Initializing... (10%)
[2024-12-21T16:39:03.000Z] Processing data... (30%)
...
```

## Testing the System

### 1. Set up database
Apply both migrations to Supabase:
```bash
# Run 20231221000001_initial_schema.sql
# Run 20231221000002_add_job_progress_logs.sql
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and fill in Supabase credentials.

### 4. Create a test job
Manually insert into database:
```sql
INSERT INTO jobs (project_id, job_type, status, input_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'mock_job',
  'pending',
  '{"test": true}'::jsonb
);
```

### 5. Run the worker
```bash
npm run worker
```

Expected output:
```
🚀 TrueDemand worker starting...
📊 Poll interval: 2000ms

📦 Found job: abc-123-def-456
   Type: mock_job
   Project: 00000000-0000-0000-0000-000000000001
   ✅ Job claimed, starting execution...
   ✅ Job completed successfully
```

### 6. Verify results
Check the job record - should show:
- `status`: `completed`
- `progress`: `100`
- `logs`: Array of timestamped messages
- `result_data`: Mock result object

## Design Decisions

### Why polling instead of triggers?
- Simpler to deploy and maintain
- Worker can run anywhere (local, VM, container)
- No need for database push notifications
- 2-second poll interval is sufficient for v1

### Why logs as TEXT[] instead of separate table?
- Simpler queries (no joins needed)
- Logs are always accessed with their job
- PostgreSQL arrays are efficient for this use case
- Easier to export/display in UI

### Why service role key for worker?
- Worker needs admin access to all tables
- Avoids RLS overhead for background processing
- Simpler than managing service accounts

### Why mark running before executing?
- Prevents race conditions with multiple workers
- Provides clear audit trail
- Allows UI to show "in progress" state immediately

## Future Enhancements (Not in Scope)

- Dead letter queue for repeatedly failing jobs
- Job priority levels
- Scheduled/delayed job execution
- Worker metrics and monitoring
- Multiple concurrent job processing
- Job dependencies and chaining

## Integration Points

### For Next.js API Routes (Future)
```typescript
import { createJob } from '@/lib/db/jobs';

// In API route handler:
const job = await createJob({
  project_id: projectId,
  job_type: 'validation',
  input_data: { market_node_id: nodeId }
});

return Response.json({ job_id: job.id });
```

### For React Query (Future)
```typescript
// Poll job status
const { data: job } = useQuery({
  queryKey: ['job', jobId],
  queryFn: () => fetch(`/api/jobs/${jobId}`).then(r => r.json()),
  refetchInterval: 2000,
  enabled: !!jobId,
});
```

## Constraints Respected

✅ **Implemented ONLY the async background job system**
✅ **Created worker polling loop and job lifecycle**
✅ **Included mock job with progress updates**
✅ **Persisted status, progress, and logs to database**

❌ Did NOT implement real validation logic
❌ Did NOT fetch Reddit, Trends, or TikTok
❌ Did NOT create UI components (only placeholder)
❌ Did NOT add unrelated API routes

## Ready for Next Steps

The job system is complete and ready for:
- PROMPT_A4: UI implementation with job status polling
- PROMPT_B1: Real validation handlers (replace mock_job)
- PROMPT_C1: Additional job types (sub-niche discovery, ideas, blueprint)
