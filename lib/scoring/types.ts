/**
 * Type definitions for the B2 Explainable Scoring System
 */

/**
 * Scoring weights for each validation dimension
 * All weights should sum to 1.0 (100%)
 */
export interface ScoringWeights {
  /** Weight for search/trend signals (0-1) */
  trend: number;
  /** Weight for social/pain signals (0-1) */
  pain: number;
  /** Weight for competition signals (0-1) */
  competition: number;
  /** Weight for financial/monetization signals (0-1) */
  monetization: number;
}

/**
 * Sub-score breakdown with per-factor details
 */
export interface ScoreBreakdown {
  /** Trend/search score (0-100) */
  trend: number;
  /** Pain/social score (0-100) */
  pain: number;
  /** Competition score (0-100) */
  competition: number;
  /** Monetization/financial score (0-100) */
  monetization: number;
  /** Audience clarity score (0-100, used as context modifier) */
  audienceClarity: number | null;
}

/**
 * Per-factor explanation with data quality indicators
 */
export interface FactorExplanation {
  /** Factor name */
  factor: 'trend' | 'pain' | 'competition' | 'monetization' | 'audienceClarity';
  /** Score for this factor (0-100) */
  score: number | null;
  /** Weight applied to this factor (0-1) */
  weight: number;
  /** Weighted contribution to final score (0-100) */
  contribution: number;
  /** Human-readable explanation */
  explanation: string;
  /** Data quality: 'strong' | 'moderate' | 'weak' | 'insufficient' */
  dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient';
  /** Specific data gaps or warnings */
  warnings?: string[];
}

/**
 * Complete scoring result with explainability
 */
export interface ScoringResult {
  /** Final opportunity score (0-100) */
  overallScore: number;
  /** Overall confidence level */
  confidence: 'high' | 'medium' | 'low';
  /** Human-readable summary explanation */
  summary: string;
  /** Detailed per-factor breakdown */
  breakdown: ScoreBreakdown;
  /** Per-factor explanations */
  factorExplanations: FactorExplanation[];
  /** Weights used for this scoring run */
  weightsUsed: ScoringWeights;
  /** Overall data quality assessment */
  dataQuality: {
    /** Number of factors with strong data (out of 4 main factors) */
    strongFactors: number;
    /** Number of factors with insufficient data */
    insufficientFactors: number;
    /** List of missing or weak signals */
    gaps: string[];
  };
  /** Timestamp when scoring was computed */
  scoredAt: string;
}

/**
 * Input data for scoring (read from validations table)
 */
export interface ScoringInput {
  /** Validation ID */
  validationId: string;
  /** Sub-scores from B1 validation */
  scores: {
    trend: number | null;
    pain: number | null;
    competition: number | null;
    monetization: number | null;
  };
  /** Audience clarity from analysis_data */
  audienceClarity: number | null;
  /** Data availability flags */
  dataSourcesAvailable: {
    reddit: boolean;
    trends: boolean;
    tiktok: boolean;
  };
  /** Optional: existing analysis data for context */
  analysisData?: any;
}

/**
 * Configuration options for scoring
 */
export interface ScoringOptions {
  /** Custom weights (if not provided, use defaults) */
  weights?: Partial<ScoringWeights>;
  /** Whether to persist the results to database */
  persist?: boolean;
}
