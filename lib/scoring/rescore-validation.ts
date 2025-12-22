import { supabase } from '../supabase/client';
import type { ScoringInput, ScoringOptions, ScoringResult } from './types';
import { computeExplainableScore } from './explainable-score';

/**
 * Re-score an existing validation with new weights
 *
 * This function:
 * 1. Fetches the validation from the database
 * 2. Extracts sub-scores and data availability
 * 3. Computes new explainable score with custom weights
 * 4. Optionally persists results back to the database
 *
 * @param validationId - UUID of the validation to re-score
 * @param options - Scoring options (custom weights, persist flag)
 * @returns Complete scoring result with explanations
 */
export async function rescoreValidation(
  validationId: string,
  options: ScoringOptions = {}
): Promise<ScoringResult> {
  // Fetch validation from database
  const { data: validation, error: fetchError } = await supabase
    .from('validations')
    .select('*')
    .eq('id', validationId)
    .single();

  if (fetchError || !validation) {
    throw new Error(
      `Failed to fetch validation ${validationId}: ${fetchError?.message || 'Not found'}`
    );
  }

  // Extract scoring input from validation
  const scoringInput: ScoringInput = {
    validationId: validation.id,
    scores: {
      trend: validation.search_score,
      pain: validation.social_score,
      competition: validation.competition_score,
      monetization: validation.financial_score,
    },
    audienceClarity: validation.analysis_data?.audience_clarity ?? null,
    dataSourcesAvailable: validation.analysis_data?.data_sources_available ?? {
      reddit: false,
      trends: false,
      tiktok: false,
    },
    analysisData: validation.analysis_data,
  };

  // Compute explainable score
  const result = computeExplainableScore(scoringInput, options);

  // Persist results if requested (default: true)
  const shouldPersist = options.persist !== false;
  if (shouldPersist) {
    await persistScoringResult(validationId, result, validation.analysis_data);
  }

  return result;
}

/**
 * Persist scoring result back to the validation record
 *
 * Updates:
 * - overall_score
 * - overall_explanation
 * - analysis_data.weights_used
 * - analysis_data.explanation (detailed breakdown)
 * - analysis_data.scored_at
 * - analysis_data.confidence
 */
async function persistScoringResult(
  validationId: string,
  result: ScoringResult,
  existingAnalysisData: any
): Promise<void> {
  // Merge new scoring data with existing analysis_data
  const updatedAnalysisData = {
    ...existingAnalysisData,
    // Scoring metadata
    weights_used: result.weightsUsed,
    scored_at: result.scoredAt,
    confidence: result.confidence,
    // Detailed explanation
    explanation: {
      summary: result.summary,
      breakdown: result.breakdown,
      factorExplanations: result.factorExplanations,
      dataQuality: result.dataQuality,
    },
  };

  // Update validation record
  const { error: updateError } = await supabase
    .from('validations')
    .update({
      overall_score: result.overallScore,
      overall_explanation: result.summary,
      analysis_data: updatedAnalysisData,
    })
    .eq('id', validationId);

  if (updateError) {
    throw new Error(
      `Failed to persist scoring result for validation ${validationId}: ${updateError.message}`
    );
  }
}

/**
 * Score a validation for the first time (called from B1 validation handler)
 *
 * This is a convenience function that wraps rescoreValidation for initial scoring.
 * It's designed to be called from the validation job handler after B1 validation completes.
 *
 * @param validationId - UUID of the newly created validation
 * @returns Complete scoring result with explanations
 */
export async function scoreValidationInitial(validationId: string): Promise<ScoringResult> {
  return rescoreValidation(validationId, { persist: true });
}
