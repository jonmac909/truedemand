-- TrueDemand Initial Schema Migration
-- Creates all core tables for the market validation workflow

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROJECTS TABLE
-- Represents a single user session through the validation workflow
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_input TEXT NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'market_selection',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (v1 is stateless/single-session)
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MARKET_NODES TABLE
-- Hierarchical structure for markets and sub-niches
-- parent_id NULL = root market, otherwise sub-niche
-- ============================================================
CREATE TABLE market_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES market_nodes(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('market', 'sub_niche')),
  name TEXT NOT NULL,
  description TEXT,
  demand_score INTEGER CHECK (demand_score >= 0 AND demand_score <= 100),
  score_explanation TEXT,
  analysis_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_root_node CHECK (
    (node_type = 'market' AND parent_id IS NULL) OR
    (node_type = 'sub_niche' AND parent_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE market_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on market_nodes" ON market_nodes
  FOR ALL USING (true) WITH CHECK (true);

-- Index for queries
CREATE INDEX idx_market_nodes_project_id ON market_nodes(project_id);
CREATE INDEX idx_market_nodes_parent_id ON market_nodes(parent_id);

-- ============================================================
-- VALIDATIONS TABLE
-- Multi-signal validation results for a selected sub-niche
-- ============================================================
CREATE TABLE validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  market_node_id UUID NOT NULL REFERENCES market_nodes(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_explanation TEXT NOT NULL,
  search_score INTEGER CHECK (search_score >= 0 AND search_score <= 100),
  social_score INTEGER CHECK (social_score >= 0 AND social_score <= 100),
  competition_score INTEGER CHECK (competition_score >= 0 AND competition_score <= 100),
  financial_score INTEGER CHECK (financial_score >= 0 AND financial_score <= 100),
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT validate_sub_niche_only CHECK (
    (SELECT node_type FROM market_nodes WHERE id = market_node_id) = 'sub_niche'
  )
);

-- Enable RLS
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on validations" ON validations
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_validations_project_id ON validations(project_id);
CREATE INDEX idx_validations_market_node_id ON validations(market_node_id);

-- ============================================================
-- VALIDATION_SOURCES TABLE
-- Individual citations and evidence supporting validation scores
-- ============================================================
CREATE TABLE validation_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  validation_id UUID NOT NULL REFERENCES validations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('search', 'social', 'competition', 'financial', 'other')),
  citation TEXT NOT NULL,
  evidence TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE validation_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on validation_sources" ON validation_sources
  FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX idx_validation_sources_validation_id ON validation_sources(validation_id);

-- ============================================================
-- IDEAS TABLE
-- Product ideas generated from validated sub-niches
-- ============================================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  validation_id UUID NOT NULL REFERENCES validations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_persona TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  differentiators TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on ideas" ON ideas
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_ideas_project_id ON ideas(project_id);
CREATE INDEX idx_ideas_validation_id ON ideas(validation_id);

-- ============================================================
-- BLUEPRINTS TABLE
-- Detailed implementation blueprints for selected product ideas
-- ============================================================
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  executive_summary TEXT NOT NULL,
  target_market_analysis TEXT NOT NULL,
  feature_roadmap JSONB NOT NULL DEFAULT '{}'::jsonb,
  positioning_strategy TEXT NOT NULL,
  gtm_recommendations TEXT NOT NULL,
  risk_assessment TEXT NOT NULL,
  full_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on blueprints" ON blueprints
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_blueprints_project_id ON blueprints(project_id);
CREATE INDEX idx_blueprints_idea_id ON blueprints(idea_id);

-- ============================================================
-- JOBS TABLE
-- Background job queue for async processing
-- ============================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN (
    'sub_niche_discovery',
    'validation',
    'idea_generation',
    'blueprint_creation'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'running',
    'completed',
    'failed'
  )),
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_completion CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed')
  )
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on jobs" ON jobs
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for job polling and status queries
CREATE INDEX idx_jobs_project_id ON jobs(project_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE projects IS 'User sessions through the market validation workflow';
COMMENT ON TABLE market_nodes IS 'Hierarchical storage for markets and sub-niches';
COMMENT ON TABLE validations IS 'Multi-signal validation results for sub-niches';
COMMENT ON TABLE validation_sources IS 'Individual citations and evidence supporting validations';
COMMENT ON TABLE ideas IS 'Product ideas generated from validated gaps';
COMMENT ON TABLE blueprints IS 'Detailed implementation plans for selected ideas';
COMMENT ON TABLE jobs IS 'Background job queue for async LLM processing';
