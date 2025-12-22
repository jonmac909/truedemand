-- Prompt Pack System Migration
-- Creates tables for managing reusable LLM prompt templates and execution logs

-- ============================================================
-- PROMPT_TEMPLATES TABLE
-- Stores reusable prompt templates with variables and schemas
-- ============================================================
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  model TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.2 CHECK (temperature >= 0 AND temperature <= 1),
  max_tokens INTEGER NOT NULL DEFAULT 2000 CHECK (max_tokens > 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on prompt_templates" ON prompt_templates
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_prompt_templates_name ON prompt_templates(name);
CREATE INDEX idx_prompt_templates_is_active ON prompt_templates(is_active);

-- ============================================================
-- PROMPT_RUNS TABLE
-- Logs all prompt executions with inputs, outputs, and metadata
-- ============================================================
CREATE TABLE prompt_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  input_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  full_prompt TEXT NOT NULL,
  output JSONB,
  raw_output TEXT,
  model TEXT NOT NULL,
  temperature NUMERIC(3,2) NOT NULL,
  max_tokens INTEGER NOT NULL,
  tokens_used INTEGER,
  duration_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prompt_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on prompt_runs" ON prompt_runs
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_prompt_runs_template_id ON prompt_runs(prompt_template_id);
CREATE INDEX idx_prompt_runs_project_id ON prompt_runs(project_id);
CREATE INDEX idx_prompt_runs_status ON prompt_runs(status);
CREATE INDEX idx_prompt_runs_created_at ON prompt_runs(created_at DESC);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on prompt_templates
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE
  ON prompt_templates FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE prompt_templates IS 'Reusable LLM prompt templates with variable placeholders and schemas';
COMMENT ON TABLE prompt_runs IS 'Execution log of all prompt runs with full inputs/outputs for reproducibility';

COMMENT ON COLUMN prompt_templates.name IS 'Unique identifier for the template (e.g., "pain_point_extractor")';
COMMENT ON COLUMN prompt_templates.prompt_template IS 'Prompt text with {{variable}} placeholders';
COMMENT ON COLUMN prompt_templates.input_schema IS 'JSON schema defining required input variables';
COMMENT ON COLUMN prompt_templates.output_schema IS 'JSON schema defining expected output structure';
COMMENT ON COLUMN prompt_templates.version IS 'Template version number, incremented on each update';

COMMENT ON COLUMN prompt_runs.input_variables IS 'Actual values provided for template variables';
COMMENT ON COLUMN prompt_runs.full_prompt IS 'The fully rendered prompt sent to the LLM';
COMMENT ON COLUMN prompt_runs.output IS 'Parsed JSON output from the LLM';
COMMENT ON COLUMN prompt_runs.raw_output IS 'Raw text response from the LLM';
