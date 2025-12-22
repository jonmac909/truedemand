# C3 QA & Acceptance Testing

## Overview

The C3 QA system provides comprehensive quality assurance for TrueDemand through:

✅ **Automated Unit Tests** - Job system and export verification
✅ **Manual QA Checklist** - End-to-end user flow validation
✅ **Runtime Assertions** - Fail-fast guardrails in critical paths
✅ **Test Infrastructure** - Playwright configuration and test scripts

---

## Quick Start

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Job system tests only
npm run test:jobs

# Export verification tests only
npm run test:exports

# Interactive UI mode
npm run test:ui

# View test report
npm run test:report
```

### Manual QA Checklist

See `tests/MANUAL_QA_CHECKLIST.md` for comprehensive manual testing procedures.

---

## Test Architecture

### Directory Structure

```
tests/
├── jobs/
│   └── job-system.spec.ts           # Job execution, retries, recovery
├── exports/
│   └── export-verification.spec.ts  # Blueprint/Marketing plan exports
├── e2e/
│   └── [Future E2E tests]           # Full user flow automation
└── MANUAL_QA_CHECKLIST.md           # Manual acceptance testing
```

### Test Infrastructure

**Playwright Configuration** (`playwright.config.ts`):
- Runs tests against `localhost:3000` by default
- Automatically starts dev server before tests
- Captures screenshots/videos on failure
- Runs tests sequentially (important for job tests)

**Runtime Assertions** (`lib/qa/assertions.ts`):
- Lightweight checks in production code
- Fail fast on invalid states
- Clear, actionable error messages

---

## Test Suites

### 1. Job System Tests

**File**: `tests/jobs/job-system.spec.ts`

**Coverage**:
- ✅ Job creation with correct initial state
- ✅ Log persistence across job lifecycle
- ✅ Retry logic (increments retry_count, resets to pending)
- ✅ Permanent failure after max_retries
- ✅ Non-retryable errors skip retry logic
- ✅ Job metadata fields are present
- ✅ Idempotency (jobs with result_data not re-executed)
- ✅ Error stack traces are stored

**Key Assertions**:
```typescript
expect(job.status).toBe('pending');
expect(job.retry_count).toBe(0);
expect(job.logs).toHaveLength(1);
```

**Run**:
```bash
npm run test:jobs
```

---

### 2. Export Verification Tests

**File**: `tests/exports/export-verification.spec.ts`

**Coverage**:
- ✅ Blueprint export includes all required sections
- ✅ Marketing plan export includes required sections
- ✅ Metadata footer with version/timestamp
- ✅ No data hallucination (output matches input exactly)
- ✅ Marketing plan indicates it's derived
- ✅ Graceful handling of empty sources/roadmap
- ✅ Special characters sanitized in Markdown
- ✅ Score breakdown table formatting
- ✅ Timestamp preservation

**Key Assertions**:
```typescript
expect(markdown).toContain('# Test Product Idea — Implementation Blueprint');
expect(markdown).toContain('Export Version: 1.0.0');
expect(markdown).toContain('78/100'); // Exact score match
```

**Run**:
```bash
npm run test:exports
```

---

### 3. Manual QA Checklist

**File**: `tests/MANUAL_QA_CHECKLIST.md`

**Scenarios** (13 total):
1. **Full User Flow** - Market → Sub-niche → Validation → Idea → Blueprint → Export
2. **"Insufficient Data" Handling** - Graceful display of data gaps
3. **Validation Caching & Reproducibility** - Identical results for same inputs
4. **Score Explainability** - All scores have readable explanations
5. **Job Execution (No Duplication)** - Jobs execute exactly once
6. **Job Recovery After Worker Crash** - Stale job recovery
7. **Job Retry Logic** - Failed jobs retry up to max_retries
8. **Job Logs Persistence** - Logs preserved across lifecycle
9. **Export Metadata Verification** - Timestamps and versions included
10. **Export Content Accuracy** - No hallucination, exact data match
11. **Demo Projects (Fast Load)** - No async delays for demos
12. **Error Handling (Silent Failures)** - Errors surfaced clearly
13. **Missing Required Data (Fail Fast)** - Clear error messages

**Pass Criteria**: 12/13 or better (excluding N/A)

**Usage**:
```bash
# Follow manual checklist
open tests/MANUAL_QA_CHECKLIST.md
```

---

## Runtime Assertions

### Assertion Library

**File**: `lib/qa/assertions.ts`

**Functions**:
- `assertDefined(value, fieldName, context)` - Value not null/undefined
- `assertNonEmptyString(value, fieldName, context)` - Non-empty string
- `assertValidScore(score, fieldName, context)` - Score is 0-100
- `assertHasKeys(obj, requiredKeys, context)` - Object has all required keys
- `assertOneOf(value, allowedValues, fieldName, context)` - Value in allowed set
- `assertSufficientData(data, context)` - Data not marked "insufficient"

**Example**:
```typescript
import { assertDefined, assertValidScore } from '@/lib/qa/assertions';

// Fail fast if required data missing
assertDefined(blueprintId, 'blueprintId', 'Export API');
assertValidScore(overallScore, 'overallScore', 'Scoring');
```

### Where Assertions Are Used

1. **Job Creation** (`lib/db/jobs.ts`):
   ```typescript
   assertNonEmptyString(params.project_id, 'project_id', 'createJob');
   assertNonEmptyString(params.job_type, 'job_type', 'createJob');
   assertDefined(params.input_data, 'input_data', 'createJob');
   ```

2. **Scoring** (`lib/scoring/explainable-score.ts`):
   ```typescript
   assertValidScore(overallScore, 'overallScore', 'computeExplainableScore');
   ```

3. **Blueprint Export** (`app/api/blueprints/[id]/export/route.ts`):
   ```typescript
   assertDefined(idea, 'idea', 'Blueprint export');
   assertDefined(validation, 'validation', 'Blueprint export');
   assertNonEmptyString(idea.title, 'idea.title', 'Blueprint export');
   assertNonEmptyString(blueprint.executive_summary, 'executive_summary', 'Blueprint export');
   ```

4. **Marketing Plan Export** (`app/api/blueprints/[id]/export-marketing/route.ts`):
   ```typescript
   assertDefined(idea, 'idea', 'Marketing plan export');
   assertNonEmptyString(blueprint.gtm_recommendations, 'gtm_recommendations', 'Marketing plan export');
   ```

---

## Testing Best Practices

### Writing Tests

1. **Descriptive Test Names**:
   ```typescript
   test('creates job with correct initial state', async () => { ... });
   // NOT: test('job test 1', async () => { ... });
   ```

2. **Clean Up Resources**:
   ```typescript
   test.afterAll(async () => {
     await supabase.from('projects').delete().eq('id', testProjectId);
   });
   ```

3. **Explicit Assertions**:
   ```typescript
   expect(job.status).toBe('pending'); // Exact match
   // NOT: expect(job).toBeTruthy();
   ```

4. **Test Isolation**:
   - Each test should be independent
   - Don't rely on test execution order
   - Use fresh test data for each test

### Running Tests in CI

```yaml
# .github/workflows/test.yml (example)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Debugging Failed Tests

### View Test Report

```bash
npm run test:report
```

This opens an HTML report with:
- Test results
- Screenshots on failure
- Videos on failure
- Trace files for debugging

### Run Tests in UI Mode

```bash
npm run test:ui
```

Interactive mode allows:
- Step-by-step test execution
- Time travel debugging
- Live code changes

### Check Logs

1. **Test Logs**:
   ```bash
   npx playwright test --reporter=list
   ```

2. **Worker Logs** (for job tests):
   ```bash
   npm run worker
   # Watch console output during test execution
   ```

3. **Database Logs**:
   ```sql
   -- Check job logs
   SELECT id, status, logs FROM jobs ORDER BY created_at DESC LIMIT 5;

   -- Check recent errors
   SELECT id, error_message FROM jobs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
   ```

---

## Known Issues & Limitations

### Limitations

1. **No E2E Automation** (Yet):
   - Full user flow requires manual testing
   - Use `tests/MANUAL_QA_CHECKLIST.md` for now
   - Future: Playwright E2E tests with seeded data

2. **Database State**:
   - Tests create real database records
   - Clean up is best-effort (use `afterAll` hooks)
   - For CI, use a test database

3. **Worker Dependency**:
   - Job tests assume worker is NOT running
   - Stop worker before running tests
   - Future: Mock worker or use test-only worker

### Common Failures

**"Blueprint not found" (404)**:
- Cause: Test database doesn't have required seed data
- Fix: Create test blueprints in `beforeAll` hook or use fixtures

**"Job already claimed by another worker"**:
- Cause: Worker is running and claiming test jobs
- Fix: Stop worker before running job tests

**"Timeout waiting for element"**:
- Cause: Slow development server or missing mock data
- Fix: Increase timeout or ensure mock data loads quickly

---

## QA Checklist for Releases

Before releasing to production, verify:

- [ ] All automated tests pass (`npm test`)
- [ ] Manual QA checklist completed (12/13 or better)
- [ ] No console errors during full user flow
- [ ] Exports download correctly (Blueprint + Marketing Plan)
- [ ] Jobs execute without duplication
- [ ] Validation caching works (identical scores on re-run)
- [ ] "Insufficient data" handled gracefully
- [ ] Error messages are clear and actionable
- [ ] Demo projects load instantly (if applicable)
- [ ] Database migrations applied successfully
- [ ] Worker restarts recover stale jobs

---

## Future Enhancements

### Planned Additions

1. **E2E Test Automation**:
   - Playwright tests for full user flow
   - Seed database with test data
   - Verify UI elements and interactions

2. **Visual Regression Testing**:
   - Screenshot comparisons
   - Detect unintended UI changes

3. **Performance Testing**:
   - Measure page load times
   - Validate job execution speed
   - Monitor database query performance

4. **Integration Tests**:
   - Test API endpoints directly
   - Verify database constraints
   - Test worker concurrency

5. **Code Coverage**:
   - Track test coverage %
   - Identify untested code paths

---

## Files Created

```
tests/
├── jobs/
│   └── job-system.spec.ts              [NEW] - Job system unit tests
├── exports/
│   └── export-verification.spec.ts     [NEW] - Export verification tests
└── MANUAL_QA_CHECKLIST.md              [NEW] - Manual testing checklist

lib/qa/
└── assertions.ts                       [NEW] - Runtime assertion utilities

playwright.config.ts                     [NEW] - Playwright configuration
package.json                             [MODIFIED] - Added test scripts

docs/
└── C3_QA_SYSTEM.md                      [NEW] - This document

app/api/blueprints/[id]/export/route.ts            [MODIFIED] - Added assertions
app/api/blueprints/[id]/export-marketing/route.ts  [MODIFIED] - Added assertions
lib/db/jobs.ts                                     [MODIFIED] - Added assertions
lib/scoring/explainable-score.ts                   [MODIFIED] - Added assertions
```

---

## Summary

C3 provides:

1. **Automated Tests** for job system and exports
2. **Manual QA Checklist** for end-to-end acceptance testing
3. **Runtime Assertions** to fail fast on invalid states
4. **Test Infrastructure** with Playwright and npm scripts

**Pass Criteria**:
- All automated tests passing
- 12/13 manual QA scenarios passing

**Next Steps**:
1. Run automated tests: `npm test`
2. Complete manual QA checklist
3. Fix any failures before release

**Philosophy**:
- **Fail fast** with runtime assertions
- **Test what matters** (user flows, job integrity, data accuracy)
- **Automate where possible**, manual test where needed
