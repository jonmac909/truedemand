/**
 * Type definitions for the B4 Prompt Pack System
 */

/**
 * Prompt template stored in the database
 */
export interface PromptTemplate {
  id: string;
  name: string;
  display_name: string;
  description: string;
  prompt_template: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  model: string;
  temperature: number;
  max_tokens: number;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Prompt run log entry
 */
export interface PromptRun {
  id: string;
  prompt_template_id: string;
  project_id: string | null;
  input_variables: Record<string, any>;
  full_prompt: string;
  output: Record<string, any> | null;
  raw_output: string | null;
  model: string;
  temperature: number;
  max_tokens: number;
  tokens_used: number | null;
  duration_ms: number | null;
  status: 'success' | 'failed';
  error_message: string | null;
  created_at: string;
}

/**
 * Input for creating a new prompt template
 */
export interface CreatePromptTemplateInput {
  name: string;
  display_name: string;
  description: string;
  prompt_template: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Input for updating an existing prompt template
 */
export interface UpdatePromptTemplateInput {
  display_name?: string;
  description?: string;
  prompt_template?: string;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
}

/**
 * Input for executing a prompt
 */
export interface ExecutePromptInput {
  template_name: string;
  variables: Record<string, any>;
  project_id?: string;
  override_model?: string;
  override_temperature?: number;
  override_max_tokens?: number;
}

/**
 * Result of a prompt execution
 */
export interface ExecutePromptResult<T = any> {
  run_id: string;
  output: T;
  raw_output: string;
  tokens_used: number;
  duration_ms: number;
  status: 'success' | 'failed';
  error_message?: string;
}

/**
 * Predefined prompt template names
 */
export enum PromptTemplateName {
  MARKET_TREE_EXPANDER = 'market_tree_expander',
  PAIN_POINT_EXTRACTOR = 'pain_point_extractor',
  IDEA_GENERATOR = 'idea_generator',
  BLUEPRINT_GENERATOR = 'blueprint_generator',
  MARKETING_PLAN_GENERATOR = 'marketing_plan_generator',
}
