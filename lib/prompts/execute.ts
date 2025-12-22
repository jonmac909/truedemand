import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../supabase/client';
import { renderTemplate, validateVariables } from './template-engine';
import type {
  PromptTemplate,
  ExecutePromptInput,
  ExecutePromptResult,
} from './types';

/**
 * Initialize Claude client
 */
function getClaudeClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({ apiKey });
}

/**
 * Execute a prompt template with the provided variables
 *
 * This function:
 * 1. Fetches the template from the database
 * 2. Validates and renders the template with variables
 * 3. Calls the LLM
 * 4. Logs the full run to prompt_runs table
 * 5. Returns the parsed output
 *
 * @param input - Execution input (template name, variables, overrides)
 * @returns Execution result with parsed output and metadata
 */
export async function executePrompt<T = any>(
  input: ExecutePromptInput
): Promise<ExecutePromptResult<T>> {
  const startTime = Date.now();

  try {
    // 1. Fetch template from database
    const { data: template, error: fetchError } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('name', input.template_name)
      .eq('is_active', true)
      .single();

    if (fetchError || !template) {
      throw new Error(
        `Prompt template "${input.template_name}" not found or inactive`
      );
    }

    const promptTemplate = template as PromptTemplate;

    // 2. Validate variables
    const validation = validateVariables(
      promptTemplate.prompt_template,
      input.variables,
      promptTemplate.input_schema
    );

    if (!validation.isValid) {
      const errors = [
        ...validation.missingVariables.map(v => `Missing: ${v}`),
        ...validation.invalidVariables,
      ];
      throw new Error(`Variable validation failed: ${errors.join(', ')}`);
    }

    // 3. Render template
    const fullPrompt = renderTemplate(
      promptTemplate.prompt_template,
      input.variables
    );

    // 4. Determine model parameters
    const model = input.override_model || promptTemplate.model;
    const temperature = input.override_temperature ?? promptTemplate.temperature;
    const maxTokens = input.override_max_tokens || promptTemplate.max_tokens;

    // 5. Call LLM
    const client = getClaudeClient();
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    });

    const rawOutput = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    const durationMs = Date.now() - startTime;

    // 6. Parse JSON output
    let parsedOutput: T;
    try {
      parsedOutput = JSON.parse(rawOutput);
    } catch (parseError) {
      // If JSON parsing fails, log the failure but don't throw yet
      const runId = await logPromptRun({
        prompt_template_id: promptTemplate.id,
        project_id: input.project_id || null,
        input_variables: input.variables,
        full_prompt: fullPrompt,
        output: null,
        raw_output: rawOutput,
        model,
        temperature,
        max_tokens: maxTokens,
        tokens_used: tokensUsed,
        duration_ms: durationMs,
        status: 'failed',
        error_message: `Failed to parse JSON output: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      });

      throw new Error(`Failed to parse JSON output from LLM. Run ID: ${runId}`);
    }

    // 7. Log successful run
    const runId = await logPromptRun({
      prompt_template_id: promptTemplate.id,
      project_id: input.project_id || null,
      input_variables: input.variables,
      full_prompt: fullPrompt,
      output: parsedOutput,
      raw_output: rawOutput,
      model,
      temperature,
      max_tokens: maxTokens,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      status: 'success',
      error_message: null,
    });

    // 8. Return result
    return {
      run_id: runId,
      output: parsedOutput,
      raw_output: rawOutput,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      status: 'success',
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log failed run (if we have template info)
    try {
      const { data: template } = await supabase
        .from('prompt_templates')
        .select('id')
        .eq('name', input.template_name)
        .single();

      if (template) {
        await logPromptRun({
          prompt_template_id: template.id,
          project_id: input.project_id || null,
          input_variables: input.variables,
          full_prompt: '',
          output: null,
          raw_output: null,
          model: input.override_model || 'unknown',
          temperature: input.override_temperature ?? 0.2,
          max_tokens: input.override_max_tokens || 2000,
          tokens_used: null,
          duration_ms: durationMs,
          status: 'failed',
          error_message: errorMessage,
        });
      }
    } catch (logError) {
      console.error('Failed to log error run:', logError);
    }

    throw error;
  }
}

/**
 * Log a prompt run to the database
 */
async function logPromptRun(data: {
  prompt_template_id: string;
  project_id: string | null;
  input_variables: Record<string, any>;
  full_prompt: string;
  output: any | null;
  raw_output: string | null;
  model: string;
  temperature: number;
  max_tokens: number;
  tokens_used: number | null;
  duration_ms: number;
  status: 'success' | 'failed';
  error_message: string | null;
}): Promise<string> {
  const { data: run, error } = await supabase
    .from('prompt_runs')
    .insert({
      prompt_template_id: data.prompt_template_id,
      project_id: data.project_id,
      input_variables: data.input_variables,
      full_prompt: data.full_prompt,
      output: data.output,
      raw_output: data.raw_output,
      model: data.model,
      temperature: data.temperature,
      max_tokens: data.max_tokens,
      tokens_used: data.tokens_used,
      duration_ms: data.duration_ms,
      status: data.status,
      error_message: data.error_message,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to log prompt run:', error);
    throw new Error(`Failed to log prompt run: ${error.message}`);
  }

  return run.id;
}

/**
 * Get a prompt template by name
 */
export async function getPromptTemplate(
  name: string
): Promise<PromptTemplate | null> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error(`Failed to fetch prompt template "${name}":`, error);
    return null;
  }

  return data as PromptTemplate;
}

/**
 * List all active prompt templates
 */
export async function listPromptTemplates(): Promise<PromptTemplate[]> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Failed to list prompt templates:', error);
    return [];
  }

  return data as PromptTemplate[];
}
