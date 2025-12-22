/**
 * B4 Prompt Pack System
 *
 * Reusable LLM prompt templates with variable interpolation,
 * enforced JSON schemas, and full execution logging.
 *
 * Usage:
 *
 * ```typescript
 * import { executePrompt, PromptTemplateName } from '@/lib/prompts';
 *
 * const result = await executePrompt({
 *   template_name: PromptTemplateName.PAIN_POINT_EXTRACTOR,
 *   variables: {
 *     niche: 'AI-powered meal planning',
 *     content_sample: '...',
 *   },
 *   project_id: 'project-uuid',
 * });
 *
 * console.log(result.output); // Parsed JSON output
 * console.log(result.run_id); // For reproducibility
 * ```
 */

export * from './types';
export * from './template-engine';
export * from './execute';
