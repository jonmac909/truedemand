# TrueDemand Test Suite

## Quick Start

```bash
# Run all tests
npm test

# Run specific suites
npm run test:jobs         # Job system tests
npm run test:exports      # Export verification tests

# Interactive mode
npm run test:ui

# View test report
npm run test:report
```

## Test Structure

```
tests/
├── jobs/                  # Job system unit tests
│   └── job-system.spec.ts
├── exports/               # Export verification tests
│   └── export-verification.spec.ts
├── e2e/                   # End-to-end tests (future)
├── MANUAL_QA_CHECKLIST.md # Manual acceptance testing
└── README.md              # This file
```

## Writing Tests

### Job System Tests

Tests for job creation, execution, retries, and recovery:

```typescript
import { test, expect } from '@playwright/test';
import { createJob, getJobById } from '../../lib/db/jobs';

test('creates job with correct initial state', async () => {
  const job = await createJob({
    project_id: 'test-id',
    job_type: 'mock_job',
    input_data: { test: 'data' },
  });

  expect(job.status).toBe('pending');
  expect(job.retry_count).toBe(0);
});
```

### Export Verification Tests

Tests for Markdown export generation and content accuracy:

```typescript
import { test, expect } from '@playwright/test';
import { blueprintToMarkdown } from '../../lib/exports';

test('blueprint export includes all sections', () => {
  const markdown = blueprintToMarkdown(mockData, metadata);

  expect(markdown).toContain('## Executive Summary');
  expect(markdown).toContain('## Data Sources & Citations');
});
```

## Manual Testing

For end-to-end user flows, use the manual QA checklist:

```bash
open tests/MANUAL_QA_CHECKLIST.md
```

Complete all 13 scenarios before releasing to production.

## Debugging

### Failed Tests

```bash
# View HTML report with screenshots/videos
npm run test:report

# Run tests with step-by-step debugging
npm run test:ui

# Verbose logging
npx playwright test --reporter=list
```

### Database Issues

If tests fail due to database state:

```sql
-- Check recent jobs
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;

-- Clean up test data
DELETE FROM jobs WHERE project_id LIKE '%test%';
```

## CI/CD Integration

Tests can run in CI with:

```yaml
- run: npm install
- run: npx playwright install --with-deps
- run: npm test
```

See `docs/C3_QA_SYSTEM.md` for full documentation.
