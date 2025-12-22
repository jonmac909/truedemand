# C3 QA - Manual Acceptance Testing Checklist

This checklist must be completed before releasing to production. Run through each scenario and mark with ✅ or ❌.

---

## Pre-Test Setup

- [ ] Next.js dev server running (`npm run dev`)
- [ ] Worker running in separate terminal (`npm run worker`)
- [ ] Database has seed data or is empty (confirm which)
- [ ] `.env` file has valid Supabase credentials

---

## 1. Full User Flow (Happy Path)

**Scenario**: User completes entire journey from market selection to export.

### Step 1: Market Selection
- [ ] Navigate to `/` (or appropriate start page)
- [ ] Select a market category (or enter custom market)
- [ ] Click "Continue" or equivalent action
- [ ] Verify: Job is created for sub-niche discovery

### Step 2: Sub-niche Discovery
- [ ] Wait for job to complete (or see loading state)
- [ ] Verify: 3-5 sub-niches are displayed
- [ ] Verify: Each sub-niche has a demand score (0-100)
- [ ] Verify: Each score has an explanation
- [ ] Select one sub-niche
- [ ] Click "Validate" or equivalent action

### Step 3: Validation
- [ ] Wait for validation job to complete
- [ ] Verify: Overall validation score (0-100) is displayed
- [ ] Verify: Score breakdown shows:
  - Search Trends score
  - Social Proof score
  - Competition score
  - Financial score
- [ ] Verify: Each score has an explanation
- [ ] Verify: "Why This Score" section is collapsible and readable
- [ ] Verify: Source citations are visible (Reddit, TikTok, Trends)
- [ ] Click "Generate Ideas" or equivalent

### Step 4: Idea Generation
- [ ] Wait for idea generation job to complete
- [ ] Verify: 3-5 product ideas are displayed
- [ ] Verify: Each idea has:
  - Title
  - Target persona
  - Value proposition
  - Differentiators
- [ ] Select one idea
- [ ] Click "Create Blueprint" or equivalent

### Step 5: Blueprint Creation
- [ ] Wait for blueprint creation job to complete
- [ ] Verify: Blueprint is displayed with sections:
  - Executive Summary
  - Target Market Analysis
  - Feature Roadmap (MVP, Phase 2, Phase 3)
  - Positioning Strategy
  - Go-to-Market Recommendations
  - Risk Assessment
- [ ] Verify: All sections have content (not "Coming Soon")
- [ ] Click "Export Blueprint" button

### Step 6: Export Blueprint
- [ ] Verify: Markdown file downloads immediately
- [ ] Verify: Filename is sanitized (e.g., `product-name-blueprint.md`)
- [ ] Open file and verify:
  - [ ] All blueprint sections present
  - [ ] Source citations included
  - [ ] Metadata footer with:
    - Generated timestamp
    - Export version
    - App version
  - [ ] No placeholder text like "[MOCKED]"
- [ ] Click "Export Marketing Plan" button

### Step 7: Export Marketing Plan
- [ ] Verify: Markdown file downloads immediately
- [ ] Verify: Filename is sanitized (e.g., `product-name-marketing-plan.md`)
- [ ] Open file and verify:
  - [ ] Product overview
  - [ ] Market context
  - [ ] Positioning strategy
  - [ ] GTM recommendations
  - [ ] Target audience summary
  - [ ] Metadata indicates "derived from blueprint"

**Result**: ✅ Pass / ❌ Fail

---

## 2. "Insufficient Data" Handling

**Scenario**: User selects a niche with weak signals.

### Test Steps
- [ ] Select an obscure/new market category
- [ ] Progress through sub-niche discovery
- [ ] Verify: If data is insufficient, system displays:
  - "Insufficient data" message (not error)
  - Explanation of what data is missing
  - Option to try different market
- [ ] Verify: No cryptic errors or crashes

**Result**: ✅ Pass / ❌ Fail

---

## 3. Validation Caching & Reproducibility

**Scenario**: Re-running validation on same sub-niche returns cached results.

### Test Steps
- [ ] Complete validation for a sub-niche
- [ ] Note the validation ID and overall score
- [ ] Navigate away and return to same sub-niche
- [ ] Trigger validation again
- [ ] Verify: Results return quickly (cached)
- [ ] Verify: Overall score is identical
- [ ] Verify: Score breakdown is identical
- [ ] Verify: Source citations are identical

**Result**: ✅ Pass / ❌ Fail

---

## 4. Score Explainability

**Scenario**: All scores have human-readable explanations.

### Test Steps
- [ ] Complete validation
- [ ] For each score (overall, search, social, competition, financial):
  - [ ] Verify score is 0-100
  - [ ] Verify explanation text exists
  - [ ] Verify explanation is readable (not JSON or code)
  - [ ] Verify explanation matches the score (e.g., high score = positive language)

**Result**: ✅ Pass / ❌ Fail

---

## 5. Job Execution (No Duplication)

**Scenario**: Jobs execute exactly once, even under concurrency.

### Test Steps
- [ ] Open browser DevTools → Network tab
- [ ] Trigger a validation job
- [ ] Verify: Only ONE job is created in database
- [ ] Check database directly:
  ```sql
  SELECT * FROM jobs WHERE job_type = 'validation' ORDER BY created_at DESC LIMIT 5;
  ```
- [ ] Verify: No duplicate jobs for same input
- [ ] Wait for job completion
- [ ] Verify: Job has `result_data` populated
- [ ] Manually change job status to `pending` in database (keep `result_data`)
- [ ] Restart worker
- [ ] Verify: Worker detects existing result (idempotent wrapper)
- [ ] Verify: Job is not re-executed

**Result**: ✅ Pass / ❌ Fail

---

## 6. Job Recovery After Worker Crash

**Scenario**: Jobs recover after worker restart.

### Test Steps
- [ ] Start worker
- [ ] Trigger a long-running job (validation or blueprint)
- [ ] Wait 2-3 seconds (job should be `running`)
- [ ] Kill worker process (Ctrl+C or `kill`)
- [ ] Wait 5+ minutes (exceeds stale threshold)
- [ ] Start worker again
- [ ] Verify: Worker logs show "Recovered X stale job(s)"
- [ ] Verify: Job completes successfully
- [ ] Check job logs in database:
  ```sql
  SELECT logs FROM jobs WHERE id = 'job-id';
  ```
- [ ] Verify: Logs contain "stale" and "resetting to pending"

**Result**: ✅ Pass / ❌ Fail

---

## 7. Job Retry Logic

**Scenario**: Failed jobs retry up to max_retries.

### Test Steps
- [ ] Modify a job handler to throw an error temporarily
  ```typescript
  throw new Error('Simulated transient failure');
  ```
- [ ] Trigger the job
- [ ] Check database:
  ```sql
  SELECT retry_count, status FROM jobs WHERE id = 'job-id';
  ```
- [ ] Verify: Job status is `pending` (queued for retry)
- [ ] Verify: `retry_count` increments after each failure
- [ ] After 3 failures (default max_retries):
  - [ ] Verify: Job status becomes `failed`
  - [ ] Verify: `retry_count` = 3
  - [ ] Verify: Job does NOT retry again

**Result**: ✅ Pass / ❌ Fail

---

## 8. Job Logs Persistence

**Scenario**: Job logs are persisted correctly.

### Test Steps
- [ ] Trigger a validation job
- [ ] During execution, check database:
  ```sql
  SELECT logs FROM jobs WHERE id = 'job-id';
  ```
- [ ] Verify: Logs array contains timestamps
- [ ] Verify: Logs show progress updates
- [ ] Wait for job completion
- [ ] Verify: Final log entry is "Job completed successfully" or similar
- [ ] Verify: All intermediate logs are preserved

**Result**: ✅ Pass / ❌ Fail

---

## 9. Export Metadata Verification

**Scenario**: Exported files contain correct metadata.

### Test Steps
- [ ] Create a blueprint
- [ ] Export blueprint
- [ ] Open exported Markdown file
- [ ] Verify footer section contains:
  - [ ] Generated timestamp (matches current time ±1 minute)
  - [ ] Export version (semver format: `1.0.0`)
  - [ ] App version (semver format: `1.0.0`)
  - [ ] Export type: "blueprint"
- [ ] Export marketing plan
- [ ] Open exported Markdown file
- [ ] Verify footer contains:
  - [ ] Export type: "Marketing Plan (derived from Implementation Blueprint)"

**Result**: ✅ Pass / ❌ Fail

---

## 10. Export Content Accuracy

**Scenario**: Exported content matches stored data (no hallucination).

### Test Steps
- [ ] Create a blueprint with known content
- [ ] Note specific values:
  - Product title
  - Validation scores (search, social, competition, financial)
  - Market name
- [ ] Export blueprint
- [ ] Open exported file
- [ ] Verify: Product title matches exactly
- [ ] Verify: All scores match exactly
- [ ] Verify: Market name matches exactly
- [ ] Verify: No fabricated data or placeholders

**Result**: ✅ Pass / ❌ Fail

---

## 11. Demo Projects (Fast Load)

**Scenario**: Demo projects load instantly without async delays.

### Test Steps
- [ ] Navigate to projects page (if demo exists)
- [ ] Click on a demo project
- [ ] Verify: Page loads in < 500ms
- [ ] Verify: No loading spinners for demo data
- [ ] Verify: All demo data is visible immediately

**Note**: If demo projects don't exist yet, mark N/A.

**Result**: ✅ Pass / ❌ Fail / N/A

---

## 12. Error Handling (Silent Failures)

**Scenario**: Errors are surfaced clearly, not silently ignored.

### Test Steps
- [ ] Disconnect network (simulate API failure)
- [ ] Try to validate a sub-niche
- [ ] Verify: User sees error message (not infinite loading)
- [ ] Verify: Error is actionable (e.g., "Retry" button)
- [ ] Reconnect network
- [ ] Click "Retry"
- [ ] Verify: Job proceeds normally

**Result**: ✅ Pass / ❌ Fail

---

## 13. Missing Required Data (Fail Fast)

**Scenario**: Missing required data fails fast with clear error.

### Test Steps
- [ ] Try to create a job with missing `input_data`:
  ```typescript
  await createJob({
    project_id: 'test-id',
    job_type: 'validation',
    input_data: {}, // Missing required field
  });
  ```
- [ ] Verify: Error is thrown immediately
- [ ] Verify: Error message explains what's missing
- [ ] Try to export a blueprint with invalid ID:
  ```
  GET /api/blueprints/invalid-id/export
  ```
- [ ] Verify: Returns 404 with clear error message

**Result**: ✅ Pass / ❌ Fail

---

## Summary

**Total Tests**: 13

**Passed**: ___ / 13

**Failed**: ___ / 13

**Blockers**: (List any critical failures)

---

## Notes

Add any additional observations or issues found during testing:

```
[Your notes here]
```

---

## Sign-Off

**Tested by**: _____________

**Date**: _____________

**Version**: _____________

**Pass Criteria**: 12/13 or better (excluding N/A)

✅ Ready for release / ❌ Requires fixes
