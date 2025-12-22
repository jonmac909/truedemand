import type { ScoringWeights } from './types';

/**
 * Default scoring weights for the B2 Explainable Scoring System
 *
 * These weights determine how much each validation dimension contributes
 * to the final Opportunity Score (0-100).
 *
 * Rationale:
 * - Pain (30%): Most important - validates real user need
 * - Monetization (25%): Critical for product viability
 * - Trend (25%): Important for market timing and growth
 * - Competition (20%): Important but can be overcome with differentiation
 *
 * Total: 100% (1.0)
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  pain: 0.30,
  monetization: 0.25,
  trend: 0.25,
  competition: 0.20,
};

/**
 * Score thresholds for data quality assessment
 */
export const SCORE_THRESHOLDS = {
  /** Score considered "strong" (70-100) */
  strong: 70,
  /** Score considered "moderate" (40-69) */
  moderate: 40,
  /** Score considered "weak" (1-39) */
  weak: 1,
  /** Score considered "insufficient" (null or 0) */
  insufficient: 0,
} as const;

/**
 * Confidence level thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  /** High confidence: 3+ strong factors, 0 insufficient */
  high: {
    minStrongFactors: 3,
    maxInsufficientFactors: 0,
  },
  /** Medium confidence: 2+ strong factors, ≤1 insufficient */
  medium: {
    minStrongFactors: 2,
    maxInsufficientFactors: 1,
  },
  /** Low confidence: everything else */
  low: {
    minStrongFactors: 0,
    maxInsufficientFactors: 4,
  },
} as const;

/**
 * Minimum score when data is insufficient
 * If a factor has no data, we treat it as 0 for scoring purposes
 */
export const INSUFFICIENT_DATA_SCORE = 0;

/**
 * Validate that weights sum to 1.0 (with small floating point tolerance)
 */
export function validateWeights(weights: ScoringWeights): boolean {
  const sum = weights.trend + weights.pain + weights.competition + weights.monetization;
  const tolerance = 0.01; // Allow 1% tolerance for floating point errors
  return Math.abs(sum - 1.0) < tolerance;
}

/**
 * Merge custom weights with defaults, ensuring they sum to 1.0
 */
export function mergeWeights(customWeights?: Partial<ScoringWeights>): ScoringWeights {
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...customWeights,
  };

  if (!validateWeights(weights)) {
    throw new Error(
      `Scoring weights must sum to 1.0. Current sum: ${weights.trend + weights.pain + weights.competition + weights.monetization}`
    );
  }

  return weights;
}
