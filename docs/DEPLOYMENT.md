# TrueDemand Deployment Guide

Complete guide for deploying TrueDemand to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Worker Deployment (Railway/Render)](#worker-deployment-railwayrender)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services

- **Supabase** - PostgreSQL database (free tier available)
  - Sign up: https://supabase.com/
- **Anthropic API** - Claude LLM access (paid)
  - Sign up: https://console.anthropic.com/
- **Apify** - TikTok data scraping (free tier available)
  - Sign up: https://console.apify.com/

### Optional Deployment Platforms

- **Vercel** - Next.js frontend hosting (free tier available)
- **Railway** or **Render** - Worker hosting (both have free tiers)

### Local Requirements

- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Git

---

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Configure Required Variables

Edit `.env` and fill in these **REQUIRED** values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LLM API
ANTHROPIC_API_KEY=sk-ant-api03-...

# External Data Sources
APIFY_API_KEY=apify_api_...
```

#### Where to Find These Values

**Supabase:**
1. Go to https://app.supabase.com/
2. Select your project
3. Go to Settings → API
4. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (**keep secret!**)

**Anthropic:**
1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create new key → Copy as `ANTHROPIC_API_KEY`

**Apify:**
1. Go to https://console.apify.com/
2. Navigate to Settings → Integrations
3. Copy Personal API token as `APIFY_API_KEY`

### Step 3: Optional Worker Configuration

These have sensible defaults, only change if needed:

```bash
WORKER_POLL_INTERVAL_MS=2000             # How often worker polls for jobs (ms)
WORKER_HEARTBEAT_INTERVAL_MS=15000       # Heartbeat frequency (ms)
WORKER_STALE_JOB_CHECK_INTERVAL_MS=60000 # Stale job check frequency (ms)
WORKER_STALE_JOB_THRESHOLD_SECONDS=300   # When jobs are considered stale (seconds)
```

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New project"
3. Choose organization, name, region, password
4. Wait for project to provision (~2 minutes)

### Step 2: Run Migrations

**Option A: Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Option B: SQL Editor (Manual)**

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order from `supabase/migrations/`:
   - `20231201000000_initial_schema.sql`
   - `20231201000001_jobs_table.sql`
   - (any additional migrations)
3. Verify tables exist: `public.projects`, `public.jobs`, etc.

### Step 3: Verify Database

Run this query in SQL Editor to verify setup:

```sql
SELECT
  table_name
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
ORDER BY
  table_name;
```

Expected tables:
- `blueprints`
- `ideas`
- `jobs`
- `market_nodes`
- `projects`
- `validation_sources`
- `validations`

---

## Deployment Options

TrueDemand has two components:

1. **Frontend (Next.js)** - Web app serving UI and API routes
2. **Worker (Node.js)** - Background job processor

### Architecture Overview

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│  Next.js App    │ ←──→ │  Supabase DB │
│  (Vercel)       │      └──────────────┘
└─────────────────┘             ↑
                                │
                         ┌──────┴──────┐
                         │   Worker    │
                         │ (Railway)   │
                         └─────────────┘
```

---

## Frontend Deployment (Vercel)

Vercel is optimized for Next.js and offers:
- ✅ Automatic builds on git push
- ✅ Global CDN
- ✅ Free SSL
- ✅ Generous free tier

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project → Settings → Environment Variables
2. Add each variable from `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (**server-side only**)
   - `ANTHROPIC_API_KEY`
   - `APIFY_API_KEY`
3. Select environments: Production, Preview, Development
4. Save

### Step 4: Redeploy

After adding env vars:

```bash
vercel --prod
```

Or trigger from Git:

```bash
git push origin main
```

### Alternative: Manual Deploy via Dashboard

1. Go to https://vercel.com/new
2. Import Git repository
3. Framework preset: Next.js (auto-detected)
4. Configure environment variables
5. Deploy

---

## Worker Deployment (Railway/Render)

The worker is a **long-running Node.js process** that polls the database for jobs. It must run continuously.

### Option A: Railway (Recommended)

**Why Railway:**
- Simple Docker deployment
- Automatic restarts
- Free $5/month credit (starter tier)
- Good for always-on services

**Steps:**

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from Dockerfile"

3. **Connect Repository**
   - Select your GitHub repo
   - Choose branch (e.g., `main`)

4. **Configure**
   - Dockerfile path: `Dockerfile.worker`
   - Set environment variables (see below)

5. **Environment Variables**

   Add in Railway dashboard:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ANTHROPIC_API_KEY=sk-ant-...
   APIFY_API_KEY=apify_api_...

   # Optional (has defaults)
   WORKER_POLL_INTERVAL_MS=2000
   WORKER_HEARTBEAT_INTERVAL_MS=15000
   ```

6. **Deploy**
   - Click "Deploy"
   - Monitor logs for: `🚀 TrueDemand worker starting...`

### Option B: Render

**Why Render:**
- Free tier available
- Easy Dockerfile deployment
- Automatic health checks

**Steps:**

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create New Web Service**
   - Dashboard → New → Background Worker
   - Connect repository

3. **Configure Service**
   ```yaml
   Name: truedemand-worker
   Environment: Docker
   Dockerfile Path: ./Dockerfile.worker
   Plan: Free (or Starter)
   ```

4. **Environment Variables**

   Add in Render dashboard (same as Railway above)

5. **Deploy**
   - Click "Create Web Service"
   - Monitor logs for startup message

### Option C: Docker Compose (Self-Hosted)

For running locally or on your own server:

```yaml
# docker-compose.yml
version: '3.8'

services:
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    env_file: .env
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Run with:

```bash
docker-compose up -d
docker-compose logs -f worker
```

---

## Post-Deployment Verification

### Frontend Health Check

1. **Visit Deployment URL**
   ```
   https://your-app.vercel.app
   ```

2. **Check Pages Load**
   - Home page (project library)
   - New project form
   - Market explorer (with mock data)

3. **Check Console (Browser DevTools)**
   - No errors related to Supabase connection
   - No missing environment variable warnings

### Worker Health Check

1. **Check Startup Logs**

   Should see:
   ```
   🚀 TrueDemand worker starting (C1 Hardened)...
   ✅ Environment validation passed
   🆔 Worker ID: hostname-12345-abc123
   📊 Poll interval: 2000ms
   💓 Heartbeat interval: 15000ms
   ```

2. **Verify Database Connection**

   Run in Supabase SQL Editor:
   ```sql
   SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5;
   ```

   Should see jobs table (may be empty initially).

3. **Test Job Execution** (optional)

   Create a test job via SQL:
   ```sql
   INSERT INTO jobs (project_id, job_type, input_data, status)
   VALUES (
     'test-project-id',
     'mock_job',
     '{"test": true}'::jsonb,
     'pending'
   );
   ```

   Worker should:
   - Claim job within 2 seconds
   - Execute handler
   - Mark as completed
   - Log: `✅ Job completed successfully`

### Environment Validation Check

Both frontend and worker validate environment on startup:

**Frontend** (check Vercel deployment logs):
```
✅ Environment validation passed
```

**Worker** (check Railway/Render logs):
```
✅ Environment validation passed
```

If you see:
```
❌ Environment validation failed:
   - ANTHROPIC_API_KEY: Anthropic Claude API key
```

→ Missing environment variable, add it in platform dashboard.

---

## Troubleshooting

### Build Failures

**Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"**

**Cause:** Environment variables not set during build.

**Fix:**
1. Vercel: Add env vars in dashboard, redeploy
2. Local: Create `.env` file with required values

---

**Error: "Type error in lib/..."**

**Cause:** TypeScript compilation failed.

**Fix:**
```bash
# Check locally
npx tsc --noEmit

# Fix type errors, commit, redeploy
```

---

### Worker Not Processing Jobs

**Symptom:** Jobs stuck in `pending` status.

**Debug Steps:**

1. **Check Worker Logs**
   - Railway: Dashboard → Deployments → View Logs
   - Render: Dashboard → Logs
   - Look for: `📦 Found job: ...`

2. **Verify Environment Variables**
   - Check all required vars are set
   - Worker logs: `✅ Environment validation passed`

3. **Check Database Connection**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM jobs WHERE status = 'pending';
   ```

4. **Verify Worker is Running**
   - Railway/Render dashboard should show "Running"
   - Check last deployment time

---

### Jobs Failing with Errors

**Symptom:** Jobs transition to `failed` status with error messages.

**Debug Steps:**

1. **Check Job Error Message**
   ```sql
   SELECT id, job_type, error_message
   FROM jobs
   WHERE status = 'failed'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. **Common Errors:**

   **"Failed to fetch Reddit signals"**
   - Reddit API rate limit or temporary outage
   - Jobs will auto-retry (up to 3 times)

   **"Anthropic API error: Invalid API key"**
   - Check `ANTHROPIC_API_KEY` is correct
   - Verify API key is active in Anthropic console

   **"Apify API error: 401 Unauthorized"**
   - Check `APIFY_API_KEY` is correct
   - Verify API key in Apify console

3. **Check Worker Logs**
   - Full stack traces logged on job failure
   - Example: `❌ Job failed: Reddit API error: 429 Too Many Requests`

---

### Stale Jobs (Stuck in "running")

**Symptom:** Jobs stuck in `running` status after worker crash.

**This is handled automatically:**
- Worker checks for stale jobs every 60 seconds
- Jobs with no heartbeat for 5+ minutes are recovered
- Logs: `🔧 Periodic recovery: 1 stale job(s) recovered`

**Manual Recovery (if needed):**
```sql
-- Reset stuck jobs to pending
UPDATE jobs
SET
  status = 'pending',
  worker_id = NULL,
  started_at = NULL,
  last_heartbeat_at = NULL
WHERE
  status = 'running'
  AND last_heartbeat_at < NOW() - INTERVAL '5 minutes';
```

---

### Database Migration Issues

**Error: "relation 'jobs' does not exist"**

**Cause:** Migrations not applied.

**Fix:**
```bash
# Using Supabase CLI
supabase db push

# Or manually run migrations in SQL Editor
```

---

**Error: "column 'result_data' does not exist"**

**Cause:** Outdated schema, missing migration.

**Fix:**
Check `supabase/migrations/` for all migration files and run in order.

---

### Frontend API Route Errors

**Error: "Supabase client error: Invalid JWT"**

**Cause:** Incorrect `SUPABASE_SERVICE_ROLE_KEY`.

**Fix:**
1. Go to Supabase → Settings → API
2. Copy **service_role** key (not anon key)
3. Update env var in Vercel
4. Redeploy

---

## Security Checklist

Before going live:

- [ ] `.env` file is in `.gitignore` (never commit secrets)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in server-side env (not exposed to browser)
- [ ] API keys rotated from defaults (if using shared examples)
- [ ] Supabase RLS (Row Level Security) policies reviewed
- [ ] Vercel environment variables set to "Production" only (not "Preview")
- [ ] Worker has restart policy configured (Railway/Render default)

---

## Monitoring & Logs

### Vercel Logs

**Real-time:**
```bash
vercel logs --follow
```

**Recent errors:**
```bash
vercel logs --output=json | grep -i error
```

### Railway Logs

- Dashboard → Deployments → View Logs
- Real-time streaming
- Search/filter by keyword

### Render Logs

- Dashboard → Logs tab
- Real-time streaming
- Download for analysis

### Supabase Logs

- Dashboard → Logs → Postgres Logs
- See database queries, errors
- Useful for debugging RLS issues

---

## Scaling Considerations

### When to Scale

**Frontend (Vercel):**
- Auto-scales automatically
- No action needed for traffic spikes

**Worker:**
- **Single worker is sufficient** for most workloads
- Each job takes ~10-60 seconds
- Worker polls every 2 seconds
- Can handle ~3-30 jobs/minute

**When to add more workers:**
- Jobs consistently queued for >5 minutes
- High volume of validation requests (>100/hour)

**How to scale workers:**
1. Railway: Increase instance count in settings
2. Render: Add replica in settings
3. Docker: Run multiple `docker-compose up` instances

**Concurrency safety:**
- Workers use atomic job claiming (safe for multiple workers)
- Only one worker claims each job
- No duplicate processing

---

## Cost Estimates

### Free Tier (Suitable for Development/Testing)

- **Supabase:** Free (500 MB database, 2 GB bandwidth/month)
- **Vercel:** Free (100 GB bandwidth, unlimited builds)
- **Railway:** $5 credit/month (enough for worker)
- **Apify:** Free tier (limited API calls)
- **Anthropic:** Pay-as-you-go (no free tier)

**Estimated monthly cost (light usage):**
- $0-20/month (mainly Anthropic API usage)

### Production Tier (Suitable for Live Product)

- **Supabase Pro:** $25/month (8 GB database, 50 GB bandwidth)
- **Vercel Pro:** $20/month (1 TB bandwidth)
- **Railway:** ~$10/month (worker 24/7)
- **Apify:** $49/month (higher limits)
- **Anthropic:** Variable (depends on usage)

**Estimated monthly cost (moderate usage):**
- $100-200/month

---

## Support

### Documentation

- **Project README:** `/README.md`
- **API Reference:** `/docs/API.md` (if exists)
- **Test Suite:** `/tests/README.md`

### External Resources

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Anthropic API:** https://docs.anthropic.com/
- **Vercel:** https://vercel.com/docs

---

## Appendix: Full Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (public) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (**server-side only**) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic Claude API key | `sk-ant-api03-...` |
| `APIFY_API_KEY` | ✅ | Apify API key for TikTok scraping | `apify_api_...` |
| `WORKER_POLL_INTERVAL_MS` | ❌ | Worker polling interval (ms) | `2000` (default) |
| `WORKER_HEARTBEAT_INTERVAL_MS` | ❌ | Worker heartbeat interval (ms) | `15000` (default) |
| `WORKER_STALE_JOB_CHECK_INTERVAL_MS` | ❌ | Stale job check interval (ms) | `60000` (default) |
| `WORKER_STALE_JOB_THRESHOLD_SECONDS` | ❌ | Stale job threshold (seconds) | `300` (default) |

---

**Last Updated:** 2024-12-22
**Version:** 1.0.0
**Prepared for:** C4 Deployment Readiness
