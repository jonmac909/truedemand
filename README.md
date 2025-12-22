# TrueDemand

A market validation web app that guides users through evidence-based product discovery.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for worker)

### 3. Set Up Database

Apply migrations to your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL files in supabase/migrations/
```

Optional: Load seed data for testing:

```bash
# Run supabase/seed.sql in your Supabase SQL editor
```

### 4. Run the Application

You'll need two terminal windows:

**Terminal 1: Next.js Dev Server**
```bash
npm run dev
```

**Terminal 2: Background Worker**
```bash
npm run worker
```

The app will be available at `http://localhost:3000`.

## Architecture

TrueDemand follows an async job architecture:

- **Frontend**: Next.js App Router with React Query for async state
- **Backend**: Next.js API routes + Supabase (PostgreSQL)
- **Jobs**: Standalone Node worker polls `jobs` table
- **LLM**: Structured JSON outputs stored in database

### User Flow

```
Market Selection → Sub-niche Discovery → Validation → Idea Generation → Blueprint → Export
```

Each step triggers a background job that processes asynchronously while the UI polls for status.

## Project Structure

```
truedemand/
├── docs/              # Product requirements and user flows
├── prompts/           # Implementation prompts (sequential)
├── supabase/
│   ├── migrations/    # Database schema migrations
│   └── seed.sql       # Demo data
├── lib/
│   ├── db/            # Database queries and utilities
│   └── supabase/      # Supabase client configuration
├── worker/
│   ├── handlers/      # Job handlers
│   ├── index.ts       # Worker polling loop
│   └── README.md      # Worker documentation
├── CLAUDE.md          # Instructions for Claude Code
└── package.json
```

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

Create a new migration:

```bash
# Create file: supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

### Adding Job Handlers

See `worker/README.md` for details on adding new job handlers.

## Documentation

- [Product Requirements](docs/PRD.md)
- [User Flows](docs/USER_FLOWS.md)
- [Worker System](worker/README.md)
- [Claude Code Instructions](CLAUDE.md)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Job Processing**: Node.js worker with polling
- **State Management**: React Query
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Supabase JS Client

## License

Private project - not licensed for public use.
