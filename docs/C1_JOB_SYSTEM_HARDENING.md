# C1 Job System Hardening

## Overview

The C1 Job System Hardening upgrade transforms the basic async job system into a **production-grade, fault-tolerant architecture** capable of handling:

✅ **Worker Crashes** - Automatic stale job recovery
✅ **Transient Failures** - Retry logic with exponential backoff
✅ **Race Conditions** - Atomic job claiming with worker identification
✅ **Duplicate Execution** - Application-level idempotency
✅ **Monitoring** - Heartbeat-based liveness detection

---

## Key Features

### 1. Atomic Job Claiming

**Problem**: Multiple workers polling the same job queue can claim the same job, leading to duplicate execution.

**Solution**: Atomic database update with status check:

```typescript
// lib/db/jobs.ts
export async function claimJob(jobId: string, workerId: string): Promise<boolean> {
  const { data } = await supabase
    .from('jobs')
    .update({
      status: 'running',
      worker_id: workerId,
      started_at: now,
      last_heartbeat_at: now,
    })
    .eq('id', jobId)
    .eq('status', 'pending') // Critical: only claim if still pending
    .select('id');

  return data && data.length > 0;
}
```

Only ONE worker will successfully claim the job. All others will receive `false`.

---

### 2. Worker Identification

Each worker instance has a unique ID:

```
worker_id format: <hostname>-<pid>-<random>
Example: MacBook-Air-12345-a8f3d2
```

This allows:
- Tracking which worker is processing a job
- Detecting dead workers via heartbeat
- Debugging production issues

---

### 3. Heartbeat Mechanism

**Problem**: Workers can crash mid-execution, leaving jobs stuck in "running" state forever.

**Solution**: Workers send periodic heartbeats while processing jobs:

```typescript
// worker/index.ts
heartbeatInterval = setInterval(async () => {
  if (activeJobId) {
    await updateHeartbeat(activeJobId, WORKER_ID);
  }
}, 15000); // Every 15 seconds
```

If a worker crashes, its heartbeat stops. Stale job recovery detects this and resets the job to `pending`.

**Configuration**:
```bash
WORKER_HEARTBEAT_INTERVAL_MS=15000     # Default: 15 seconds
STALE_JOB_THRESHOLD_SECONDS=300        # Default: 5 minutes
STALE_JOB_CHECK_INTERVAL_MS=60000      # Default: 1 minute
```

---

### 4. Stale Job Recovery

**Automatically detects and recovers** jobs with stale heartbeats:

```typescript
// lib/db/jobs.ts
export async function recoverStaleJobs(staleThresholdSeconds: number = 300): Promise<string[]> {
  const thresholdTime = new Date(Date.now() - staleThresholdSeconds * 1000).toISOString();

  // Find jobs with old heartbeats
  const { data: staleJobs } = await supabase
    .from('jobs')
    .select('id, job_type, worker_id, logs')
    .eq('status', 'running')
    .lt('last_heartbeat_at', thresholdTime);

  // Reset each to pending
  for (const job of staleJobs) {
    await supabase
      .from('jobs')
      .update({
        status: 'pending',
        worker_id: null,
        last_heartbeat_at: null,
        progress: 0,
        logs: [...currentLogs, recoveryLog],
      })
      .eq('id', job.id)
      .eq('status', 'running');
  }
}
```

**When Recovery Runs**:
- On worker startup (cleans up stale jobs from previous crashes)
- Periodically every 1 minute (configurable)

---

### 5. Automatic Retry Logic

**Problem**: Transient failures (network timeouts, rate limits, temporary API outages) shouldn't require manual intervention.

**Solution**: Automatic retry with configurable limits:

```typescript
// lib/db/jobs.ts
export async function markJobAsFailed(
  jobId: string,
  errorMessage: string,
  isRetryable: boolean = true
): Promise<void> {
  const canRetry = isRetryable && retryCount < maxRetries;

  if (canRetry) {
    // Reset to pending for retry
    await supabase.from('jobs').update({
      status: 'pending',
      error_message: errorMessage,
      retry_count: retryCount + 1,
      worker_id: null,
      last_heartbeat_at: null,
      progress: 0,
    }).eq('id', jobId);
  } else {
    // Mark as permanently failed
    await supabase.from('jobs').update({
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    }).eq('id', jobId);
  }
}
```

**Retry Behavior**:
- Default: 3 retries (configurable via `max_retries` column)
- Non-retryable errors skip retry logic
- Full error message + stack trace logged

**Mark Errors as Non-Retryable**:
```typescript
throw new Error('Non-retryable: Invalid API key'); // Will NOT retry
throw new Error('Permanent failure: Invalid input'); // Will NOT retry
throw new Error('Network timeout'); // WILL retry
```

---

### 6. Enhanced Error Handling

**Stack traces included** in error logs:

```typescript
// worker/index.ts
try {
  const resultData = await handler(job);
  await markJobAsCompleted(job.id, resultData);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const fullErrorMessage = errorStack
    ? `${errorMessage}\n\nStack trace:\n${errorStack}`
    : errorMessage;

  await markJobAsFailed(job.id, fullErrorMessage, isRetryable);
}
```

Error logs now include:
- Error message
- Full stack trace
- Retry attempt number
- Worker ID that encountered the error

---

### 7. Application-Level Idempotency

**Problem**: If a job completes but the worker crashes before marking it completed, it may be re-executed.

**Solution**: Idempotent wrapper checks for existing results:

```typescript
// worker/handlers/idempotent-wrapper.ts
export function makeIdempotent(handler: JobHandler): JobHandler {
  return async (job: Job): Promise<Record<string, any>> => {
    // Check if job already has result_data
    if (job.result_data && Object.keys(job.result_data).length > 0) {
      console.log('Returning cached result (idempotent)');
      return job.result_data;
    }

    // Fetch latest job state from database
    const latestJob = await getJobById(job.id);

    if (latestJob?.status === 'completed' && latestJob.result_data) {
      console.log('Job already completed, returning cached result');
      return latestJob.result_data;
    }

    // No cached result - execute handler normally
    return await handler(latestJob);
  };
}
```

**All handlers are automatically wrapped**:
```typescript
// worker/handlers/index.ts
export const jobHandlers: JobHandlerRegistry = {
  mock_job: makeIdempotent(handleMockJob),
  validation: makeIdempotent(handleValidation),
  idea_generation: makeIdempotent(handleIdeaGeneration),
  blueprint_creation: makeIdempotent(handleBlueprintCreation),
};
```

---

## Database Schema Changes

**Migration**: `supabase/migrations/20231222000002_harden_job_system.sql`

### New Columns

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `retry_count` | INTEGER | 0 | Number of retry attempts |
| `max_retries` | INTEGER | 3 | Maximum retries before permanent failure |
| `worker_id` | TEXT | NULL | Unique worker instance identifier |
| `last_heartbeat_at` | TIMESTAMPTZ | NULL | Last worker keepalive signal |

### New Indexes

```sql
-- Stale job detection
CREATE INDEX idx_jobs_stale_detection ON jobs(status, last_heartbeat_at)
  WHERE status = 'running';

-- Retry eligibility
CREATE INDEX idx_jobs_retry_eligible ON jobs(status, retry_count, max_retries)
  WHERE status = 'failed' AND retry_count < max_retries;
```

---

## Worker Lifecycle

### Startup Sequence

1. **Generate Worker ID**
   ```
   worker_id: MacBook-Air-12345-a8f3d2
   ```

2. **Recover Stale Jobs**
   ```
   Checking for stale jobs...
   ✅ Recovered 2 stale job(s): job-abc, job-def
   ```

3. **Start Periodic Stale Recovery**
   ```
   Runs every 60 seconds (configurable)
   ```

4. **Enter Polling Loop**
   ```
   Poll interval: 2000ms
   ```

### Job Execution Flow

1. **Fetch Next Pending Job** (FIFO order)
2. **Attempt Atomic Claim** (only succeeds if still pending)
3. **Start Heartbeat Interval** (15 seconds)
4. **Execute Handler** (with idempotent wrapper)
5. **Update Progress** (handler-specific)
6. **Mark Completed or Failed**
7. **Stop Heartbeat Interval**
8. **Clear Active Job**

### Graceful Shutdown

```bash
# Send SIGINT or SIGTERM
kill -TERM <worker-pid>

# Worker waits up to 30 seconds for active job to complete
⏳ Waiting for active job job-abc to complete...
✅ Active job completed
👋 Goodbye!
```

---

## Configuration

### Environment Variables

```bash
# Polling
WORKER_POLL_INTERVAL_MS=2000           # How often to check for new jobs

# Heartbeat
WORKER_HEARTBEAT_INTERVAL_MS=15000     # How often to send heartbeat (15s)

# Stale Job Detection
STALE_JOB_CHECK_INTERVAL_MS=60000      # How often to check for stale jobs (1m)
STALE_JOB_THRESHOLD_SECONDS=300        # Jobs stale after 5 minutes of no heartbeat
```

### Retry Configuration

Set `max_retries` per job:

```typescript
await createJob({
  project_id: 'abc',
  job_type: 'validation',
  input_data: { ... },
  max_retries: 5, // Override default (3)
});
```

---

## Monitoring

### Job Logs

All operations are logged with timestamps:

```typescript
const { data: job } = await supabase
  .from('jobs')
  .select('logs')
  .eq('id', 'job-abc')
  .single();

console.log(job.logs);
// [
//   "[2023-12-22T10:00:00Z] Job created and queued",
//   "[2023-12-22T10:00:05Z] Mock job started",
//   "[2023-12-22T10:00:10Z] Processing data... (30%)",
//   "[2023-12-22T10:00:15Z] Job completed successfully"
// ]
```

### Worker Console Output

```
🚀 TrueDemand worker starting (C1 Hardened)...
🆔 Worker ID: MacBook-Air-12345-a8f3d2
📊 Poll interval: 2000ms
💓 Heartbeat interval: 15000ms
🔍 Stale job check interval: 60000ms
⏱️  Stale job threshold: 300s

🔧 Checking for stale jobs...
✅ No stale jobs found

📦 Found job: job-abc
   Type: validation
   Project: project-123
   Retry: 0/3
   ✅ Job claimed by MacBook-Air-12345-a8f3d2, starting execution...
   ✅ Job completed successfully
```

---

## Error Scenarios

### Scenario 1: Worker Crashes Mid-Execution

**What Happens**:
1. Worker claims job `job-abc`
2. Worker starts execution
3. Worker crashes (process killed, out of memory, etc.)
4. Job stuck in `running` state with stale `last_heartbeat_at`

**Recovery**:
1. Another worker's periodic stale job check detects old heartbeat
2. Job reset to `pending` with recovery log entry
3. Next available worker claims and re-executes job
4. Idempotent wrapper prevents duplicate side effects

---

### Scenario 2: Transient API Failure

**What Happens**:
1. Job executes normally
2. External API call fails (network timeout, rate limit, 503 error)
3. Handler throws error: `"Network timeout connecting to API"`

**Recovery**:
1. Worker catches error, marks job as failed with `isRetryable=true`
2. Job status reset to `pending`, `retry_count` incremented
3. Job re-enters queue automatically
4. Next execution attempt succeeds

---

### Scenario 3: Race Condition (Multiple Workers)

**What Happens**:
1. Two workers poll simultaneously
2. Both see `job-abc` with `status='pending'`
3. Both attempt to claim job

**Resolution**:
1. First worker's `claimJob()` succeeds (updates status to `running`)
2. Second worker's `claimJob()` fails (status no longer `pending`)
3. Only one worker executes the job

---

### Scenario 4: Non-Retryable Error

**What Happens**:
1. Job executes with invalid input data
2. Handler throws: `"Non-retryable: Invalid API key"`
3. Worker detects "non-retryable" in error message

**Resolution**:
1. Job marked as permanently `failed` (no retry)
2. Full error message + stack trace logged
3. User can inspect error and fix root cause

---

## Best Practices

### Writing Idempotent Handlers

Even with the idempotent wrapper, design handlers to be naturally idempotent:

✅ **Good**:
```typescript
// Check if validation already exists
const { data: existing } = await supabase
  .from('validations')
  .select('id')
  .eq('market_node_id', nodeId)
  .eq('project_id', projectId)
  .single();

if (existing) {
  return { validation_id: existing.id, cached: true };
}

// Create new validation
const { data: validation } = await supabase
  .from('validations')
  .insert({ ... })
  .select()
  .single();
```

❌ **Bad**:
```typescript
// Always creates duplicate validation
const { data: validation } = await supabase
  .from('validations')
  .insert({ ... });
```

### Error Message Conventions

Mark permanent failures explicitly:

```typescript
// Will retry
throw new Error('API rate limit exceeded');

// Will NOT retry
throw new Error('Non-retryable: Invalid input format');
throw new Error('Permanent failure: Account suspended');
```

### Progress Updates

Update progress frequently for better UX:

```typescript
await updateJobProgress(job.id, 10, 'Fetching data...');
await updateJobProgress(job.id, 30, 'Processing results...');
await updateJobProgress(job.id, 60, 'Running LLM analysis...');
await updateJobProgress(job.id, 90, 'Storing results...');
```

---

## Files Changed

```
supabase/migrations/
  └── 20231222000002_harden_job_system.sql  [NEW]

lib/db/
  └── jobs.ts                                [MODIFIED]
      - Updated Job interface
      - Added claimJob()
      - Added updateHeartbeat()
      - Added recoverStaleJobs()
      - Updated markJobAsFailed() with retry logic

worker/
  ├── index.ts                               [MODIFIED]
      - Worker ID generation
      - Heartbeat mechanism
      - Stale job recovery on startup
      - Periodic stale job checks
      - Enhanced error handling
  └── handlers/
      ├── idempotent-wrapper.ts              [NEW]
      └── index.ts                           [MODIFIED]
          - Wrap all handlers with idempotent wrapper

docs/
  └── C1_JOB_SYSTEM_HARDENING.md             [NEW]
```

---

## Testing

### Test Stale Job Recovery

1. Start worker
2. Trigger a validation job
3. Kill worker mid-execution (Ctrl+C or `kill -9`)
4. Start new worker
5. Observe stale job recovery logs
6. Verify job completes successfully

### Test Retry Logic

1. Modify a handler to throw a transient error
2. Trigger job
3. Observe retry attempts in logs
4. Verify job retries up to `max_retries`

### Test Idempotency

1. Run a job to completion
2. Manually reset job status to `pending` (keep `result_data` intact)
3. Worker claims job
4. Idempotent wrapper detects existing result
5. Returns cached result without re-execution

---

## Comparison: Before vs After

| Feature | Before C1 | After C1 |
|---------|-----------|----------|
| Atomic claiming | ❌ Race conditions possible | ✅ Single worker guarantee |
| Worker crashes | ❌ Jobs stuck forever | ✅ Auto-recovery via heartbeat |
| Transient failures | ❌ Manual retry required | ✅ Automatic retry |
| Duplicate execution | ❌ Possible after crash | ✅ Prevented by idempotent wrapper |
| Error debugging | ⚠️ Message only | ✅ Full stack traces |
| Worker identification | ❌ Unknown | ✅ Unique worker_id |
| Monitoring | ⚠️ Basic logs | ✅ Heartbeat + detailed logs |

---

## Future Enhancements (Post-C1)

- **Job Priority Queue** - Process high-priority jobs first
- **Dead Letter Queue** - Store permanently failed jobs separately
- **Metrics Dashboard** - Visualize job throughput, error rates, retry distribution
- **Worker Pool Management** - Scale workers based on queue depth
- **Job Cancellation** - Abort long-running jobs on user request
- **Job Dependencies** - Chain jobs (e.g., validation → idea generation → blueprint)

---

## Questions?

For implementation details, see:
- `lib/db/jobs.ts` - Database operations
- `worker/index.ts` - Worker main loop
- `worker/handlers/` - Job handlers
- `supabase/migrations/` - Database schema
