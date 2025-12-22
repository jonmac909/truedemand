# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TrueDemand** is a market validation web app that guides users through a linear workflow: Market Selection → Sub-niche Discovery → Validation → Idea Generation → Blueprint → Export.

Success = user exports a cited, evidence-based product blueprint.

## Core Architecture Principles

### 1. Async Job Architecture (CRITICAL)
- **UI never blocks** during any analysis or heavy computation
- All heavy work (LLM calls, data analysis, scoring) runs in **background jobs**
- Jobs are polled via a standalone Node worker process
- Use React Query for async state management in the frontend
- Jobs table in Supabase stores job state and results

### 2. Data Integrity Rules
- **Never hallucinate data**: If signals are missing, explicitly return `"insufficient data"`
- **All LLM outputs MUST be structured JSON** and stored in the database
- **Every score requires a human-readable explanation**
- Store raw LLM responses for audit/debugging

### 3. Tech Stack (Locked)
- **Frontend**: Next.js App Router + TypeScript + Tailwind + shadcn/ui
- **Backend**: Next.js Route Handlers + Supabase (Postgres)
- **Jobs**: Standalone Node worker polling `jobs` table
- **LLM Integration**: Structured JSON outputs only
- **State Management**: React Query for async operations

### 4. Design System (LOCKED - Production-Ready)
**CRITICAL**: All UI components MUST use the locked design system.

- **Primary Color**: `#2563EB` (trustworthy blue, NOT purple)
- **Shared Components**: Located in `components/ui/` (Button, Card, Stepper, Input, Badge)
- **Complete Spec**: See `DESIGN_SYSTEM.md` for exact pixel values, spacing, and typography
- **Component Guide**: See `COMPONENT_GUIDE.md` for code examples and patterns
- **Design Tokens**: Import from `lib/design-tokens.ts`

**Rules:**
- NEVER create inline button/card styles — use `<Button>`, `<Card>`, etc.
- NEVER hardcode colors — use design tokens or Tailwind classes from the approved palette
- NEVER create animations >200ms — keep interactions fast and subtle
- ALL new UI must match the onboarding flow's visual style exactly

## User Flow Architecture

The app is a **stateless, single-session experience** (v1):

1. **Market Selection** → User picks/enters market category
2. **Sub-niche Discovery** → Job analyzes and surfaces 3-5 sub-niches with scores
3. **Validation** → Multi-signal job validates selected sub-niche (search, social, competition, financial)
4. **Idea Generation** → Job generates 3-5 product ideas from validated gaps
5. **Blueprint Creation** → Job creates detailed implementation plan with citations
6. **Export** → User downloads PDF/Markdown immediately (no save/share)

Each step triggers a background job. UI shows loading states, never blocks.

## v1 Non-Goals (Do NOT implement)

- User accounts or saved projects
- Collaborative features or sharing
- Payment processing
- Live data feeds or real-time dashboards
- Custom data uploads
- A/B testing frameworks

## Common Commands

```bash
# Start Next.js development server (runs on port 3000)
npm run dev

# Start background job worker (run in separate terminal)
npm run worker

# Run worker once (for testing, no watch mode)
npm run worker:once

# Install dependencies
npm install

# TypeScript type checking
npx tsc --noEmit

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Environment Setup

Required environment variables in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (for worker)
```

Copy `.env.example` to `.env` and fill in your credentials.

## Database Setup

The project uses Supabase (PostgreSQL) with migrations in `supabase/migrations/`:

```bash
# Apply migrations using Supabase CLI
supabase db push

# Or manually run SQL files in Supabase SQL editor
# Files are in supabase/migrations/

# Load seed data (optional, for testing)
# Run supabase/seed.sql in SQL editor
```

**Database Schema Overview:**
- `projects` — User's market validation projects
- `market_nodes` — Hierarchical market/sub-niche tree (uses `parent_id` for tree structure)
- `validations` — Multi-signal validation results per market node
- `validation_sources` — Individual data sources cited in validations
- `ideas` — Product ideas generated from validated markets
- `blueprints` — Detailed implementation plans with citations
- `jobs` — Background job queue and history (status: pending → running → completed/failed)

All tables have RLS enabled. Foreign keys enforce referential integrity.

## High-Level Architecture

### Frontend Structure
- **App Router Layout**: Persistent sidebar navigation (`components/app-sidebar.tsx`) with content area
- **Onboarding Flow**: 4-step flow using ONLY shared components from `components/ui/`
  - Step 1: Market Selection (selectable cards)
  - Step 2: Data Scanning (loading state)
  - Step 3: Insights Review (code output + copy)
  - Step 4: Launch Strategy (feature cards)
- **Page Components**: Located in `app/` directory
  - `/` — Project Library (card grid with search)
  - `/onboarding/step-1` through `/onboarding/step-4` — Onboarding flow
  - `/explorer` — Market Tree Explorer (split view: tree + detail panel)
  - `/new` — New Project form (centered card)
  - `/validation` — Validation page (stub)
  - `/blueprint` — Blueprint page (stub)
- **Shared Layout**: `components/app-layout.tsx` wraps pages with sidebar + top bar
- **Mock Data**: All pages currently use mock data with `// TODO:` comments marking API integration points

### Worker System
- **Worker Process**: `worker/index.ts` polls `jobs` table every 2 seconds
- **Job Handlers**: Located in `worker/handlers/` (currently only `mock-job.ts` exists)
- **Job Lifecycle**:
  1. API route creates job with `status: 'pending'`
  2. Worker claims job atomically, sets `status: 'running'`
  3. Handler updates `progress` (0-100) and appends to `logs` array
  4. Worker marks job `completed` or `failed` with result stored in `result` JSONB column
- **Database Functions**: `lib/db/jobs.ts` provides type-safe job CRUD operations
- **Restart Safety**: Worker uses atomic updates to prevent race conditions

### Design System Implementation

**Shared Components** (in `components/ui/`):
- `Button` - 4 variants (primary, secondary, ghost, link), 3 sizes, loading state
- `Card` - 4 variants (default, selectable, selected, feature), 4 padding options
- `Stepper` - Horizontal progress indicator with emoji states
- `Input` - Styled text input matching approved design
- `Badge` - 6 semantic variants (primary, secondary, success, warning, error, outline)

**Usage Pattern:**
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ✓ GOOD
<Card variant="selectable" padding="default">
  <h3>Card Title</h3>
  <Button>Action</Button>
</Card>

// ✗ BAD - Never do this
<div className="bg-white p-6 rounded-lg border">
  <button className="bg-blue-500 px-4 py-2">Action</button>
</div>
```

### Integration Points (TODO)

Current implementation uses mock data. Search for `// TODO:` comments to find integration points:

- **API Routes** (not yet implemented): Will live in `app/api/`
- **Job Triggers**: UI will call API routes that enqueue jobs
- **Job Polling UI**: Need to implement `JobProgressPolling` component that polls job status
- **React Query**: Not yet configured — will manage async state for job polling
- **Supabase Client**: Frontend client not yet configured (only worker has `lib/supabase/client.ts`)

## Development Workflow

Follow the prompt-driven development flow:

1. Read `/prompts/PROMPT_00_SYSTEM.md` first (system-wide rules)
2. Follow sequential prompts in `/prompts/` for implementation
3. Reference `/docs/PRD.md` and `/docs/USER_FLOWS.md` for product context

**Completed Phases:**
- ✅ A2: Database schema and seed data
- ✅ A3: Async job system and worker
- ✅ A4: UI scaffold with routes and navigation
- ✅ Design System: Locked blue theme with shared components

## Key Files & Directories

- `/prompts/` — Step-by-step implementation prompts (follow in order)
- `/docs/` — Product requirements and user flow documentation
- `/supabase/migrations/` — Database schema migrations
- `/worker/` — Background job worker and handlers
- `/lib/db/` — Database utility functions
- `/lib/design-tokens.ts` — Centralized design system tokens
- `/components/ui/` — Shared, reusable components (LOCKED design system)
- `/components/` — App-specific components (sidebar, navigation, job polling)
- `/app/` — Next.js App Router pages and API routes
- `DESIGN_SYSTEM.md` — Complete visual language specification (LOCKED)
- `COMPONENT_GUIDE.md` — Developer quick reference for components

## Decision-Making Philosophy

- **Incremental delivery over completeness** — ship working features iteratively
- **Make reasonable defaults** — only ask clarifying questions if blocking
- **Document assumptions** — note any defaults or decisions made
- **Design system compliance** — ALL UI must use shared components from `components/ui/`
