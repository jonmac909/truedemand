Create Supabase SQL migrations with the following tables ONLY:

Tables:
- projects
- market_nodes
- validations
- validation_sources
- ideas
- blueprints
- jobs

Requirements:
- Enable RLS on all tables
- Foreign keys everywhere
- JSONB for flexible fields
- created_at timestamps
- Seed 1 demo project with partial data

Deliverables:
- /supabase/migrations/*.sql
- /supabase/seed.sql

Avoid over-normalization.
Do not create API routes or UI yet.
