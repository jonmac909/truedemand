import type {
  ScoringInput,
  ScoringOptions,
  ScoringResult,
  FactorExplanation,
  ScoreBreakdown,
} from './types';
import {
  DEFAULT_WEIGHTS,
  SCORE_THRESHOLDS,
  CONFIDENCE_THRESHOLDS,
  INSUFFICIENT_DATA_SCORE,
  mergeWeights,
} from './config';

/**
 * B2 Explainable Scoring System
 *
 * Computes a final Opportunity Score (0-100) from B1 validation outputs
 * with full explainability, configurable weights, and insufficient data handling.
 *
 * @param input - Validation data with sub-scores from B1
 * @param options - Scoring options (custom weights, etc.)
 * @returns Complete scoring result with explanations
 */
export function computeExplainableScore(
  input: ScoringInput,
  options: ScoringOptions = {}
): ScoringResult {
  // Merge custom weights with defaults
  const weights = mergeWeights(options.weights);

  // Build score breakdown
  const breakdown: ScoreBreakdown = {
    trend: input.scores.trend ?? INSUFFICIENT_DATA_SCORE,
    pain: input.scores.pain ?? INSUFFICIENT_DATA_SCORE,
    competition: input.scores.competition ?? INSUFFICIENT_DATA_SCORE,
    monetization: input.scores.monetization ?? INSUFFICIENT_DATA_SCORE,
    audienceClarity: input.audienceClarity,
  };

  // Generate per-factor explanations
  const factorExplanations: FactorExplanation[] = [
    explainTrendFactor(breakdown.trend, weights.trend, input.dataSourcesAvailable.trends),
    explainPainFactor(breakdown.pain, weights.pain, input.dataSourcesAvailable.reddit),
    explainCompetitionFactor(breakdown.competition, weights.competition, input.dataSourcesAvailable.reddit),
    explainMonetizationFactor(
      breakdown.monetization,
      weights.monetization,
      input.dataSourcesAvailable.reddit && input.audienceClarity !== null
    ),
  ];

  // Compute weighted overall score
  const overallScore = Math.round(
    breakdown.trend * weights.trend +
    breakdown.pain * weights.pain +
    breakdown.competition * weights.competition +
    breakdown.monetization * weights.monetization
  );

  // Assess data quality
  const dataQuality = assessDataQuality(factorExplanations, breakdown);

  // Determine confidence level
  const confidence = determineConfidence(dataQuality);

  // Apply audience clarity modifier (if available)
  const audienceClarityModifier = computeAudienceClarityModifier(breakdown.audienceClarity);

  // Generate summary explanation
  const summary = generateSummary(
    overallScore,
    confidence,
    factorExplanations,
    dataQuality,
    audienceClarityModifier
  );

  return {
    overallScore,
    confidence,
    summary,
    breakdown,
    factorExplanations,
    weightsUsed: weights,
    dataQuality,
    scoredAt: new Date().toISOString(),
  };
}

/**
 * Explain the Trend factor (search volume/momentum)
 */
function explainTrendFactor(
  score: number,
  weight: number,
  hasData: boolean
): FactorExplanation {
  const contribution = Math.round(score * weight);

  if (!hasData || score === INSUFFICIENT_DATA_SCORE) {
    return {
      factor: 'trend',
      score,
      weight,
      contribution,
      explanation: 'Search trend data unavailable. Cannot assess market momentum.',
      dataQuality: 'insufficient',
      warnings: ['No Google Trends data available'],
    };
  }

  let explanation = '';
  let dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient' = 'moderate';
  const warnings: string[] = [];

  if (score >= SCORE_THRESHOLDS.strong) {
    explanation = `Strong upward search trend with solid growth momentum. Market interest is rising consistently.`;
    dataQuality = 'strong';
  } else if (score >= SCORE_THRESHOLDS.moderate) {
    explanation = `Moderate search interest with stable or slightly growing trend. Market shows baseline demand.`;
    dataQuality = 'moderate';
  } else if (score >= SCORE_THRESHOLDS.weak) {
    explanation = `Weak search trend indicates declining or low interest. Market momentum is limited.`;
    dataQuality = 'weak';
    warnings.push('Low search volume may indicate niche or declining market');
  } else {
    explanation = 'Insufficient search trend data.';
    dataQuality = 'insufficient';
    warnings.push('Search trend score is unexpectedly low');
  }

  return {
    factor: 'trend',
    score,
    weight,
    contribution,
    explanation,
    dataQuality,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Explain the Pain factor (user frustration/need intensity)
 */
function explainPainFactor(
  score: number,
  weight: number,
  hasData: boolean
): FactorExplanation {
  const contribution = Math.round(score * weight);

  if (!hasData || score === INSUFFICIENT_DATA_SCORE) {
    return {
      factor: 'pain',
      score,
      weight,
      contribution,
      explanation: 'Social discussion data unavailable. Cannot assess pain intensity.',
      dataQuality: 'insufficient',
      warnings: ['No Reddit data available for pain analysis'],
    };
  }

  let explanation = '';
  let dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient' = 'moderate';
  const warnings: string[] = [];

  if (score >= SCORE_THRESHOLDS.strong) {
    explanation = `Critical pain points identified with high intensity. Users are actively seeking solutions.`;
    dataQuality = 'strong';
  } else if (score >= SCORE_THRESHOLDS.moderate) {
    explanation = `Moderate pain signals detected. Users express frustration but may not urgently seek solutions.`;
    dataQuality = 'moderate';
    warnings.push('Pain intensity could be stronger for product-market fit');
  } else if (score >= SCORE_THRESHOLDS.weak) {
    explanation = `Low pain signals. Users mention issues but without urgency or intensity.`;
    dataQuality = 'weak';
    warnings.push('Weak pain signals may indicate low willingness to pay');
  } else {
    explanation = 'Insufficient pain data from social discussions.';
    dataQuality = 'insufficient';
    warnings.push('Pain score is unexpectedly low');
  }

  return {
    factor: 'pain',
    score,
    weight,
    contribution,
    explanation,
    dataQuality,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Explain the Competition factor (market saturation)
 */
function explainCompetitionFactor(
  score: number,
  weight: number,
  hasData: boolean
): FactorExplanation {
  const contribution = Math.round(score * weight);

  if (!hasData || score === INSUFFICIENT_DATA_SCORE) {
    return {
      factor: 'competition',
      score,
      weight,
      contribution,
      explanation: 'Competition data unavailable. Cannot assess market saturation.',
      dataQuality: 'insufficient',
      warnings: ['No data available for competition analysis'],
    };
  }

  let explanation = '';
  let dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient' = 'moderate';
  const warnings: string[] = [];

  if (score >= SCORE_THRESHOLDS.strong) {
    explanation = `Low competition with fragmented market. Good opportunity for differentiation.`;
    dataQuality = 'strong';
  } else if (score >= SCORE_THRESHOLDS.moderate) {
    explanation = `Moderate competition. Market has established players but room for new entrants.`;
    dataQuality = 'moderate';
  } else if (score >= SCORE_THRESHOLDS.weak) {
    explanation = `High competition in concentrated market. Differentiation will be challenging.`;
    dataQuality = 'weak';
    warnings.push('High competition may require significant differentiation');
  } else {
    explanation = 'Insufficient competition data.';
    dataQuality = 'insufficient';
    warnings.push('Competition assessment is incomplete');
  }

  return {
    factor: 'competition',
    score,
    weight,
    contribution,
    explanation,
    dataQuality,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Explain the Monetization factor (revenue potential)
 */
function explainMonetizationFactor(
  score: number,
  weight: number,
  hasData: boolean
): FactorExplanation {
  const contribution = Math.round(score * weight);

  if (!hasData || score === INSUFFICIENT_DATA_SCORE) {
    return {
      factor: 'monetization',
      score,
      weight,
      contribution,
      explanation: 'Monetization data unavailable. Cannot assess revenue potential.',
      dataQuality: 'insufficient',
      warnings: ['Insufficient data for monetization analysis (requires pain + audience clarity)'],
    };
  }

  let explanation = '';
  let dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient' = 'moderate';
  const warnings: string[] = [];

  if (score >= SCORE_THRESHOLDS.strong) {
    explanation = `Strong monetization potential. Clear audience with critical pain indicates high willingness to pay.`;
    dataQuality = 'strong';
  } else if (score >= SCORE_THRESHOLDS.moderate) {
    explanation = `Moderate monetization potential. Audience or pain clarity needs improvement for higher revenue confidence.`;
    dataQuality = 'moderate';
    warnings.push('Monetization potential could be higher with clearer audience or pain signals');
  } else if (score >= SCORE_THRESHOLDS.weak) {
    explanation = `Low monetization potential. Unclear audience or weak pain signals reduce revenue confidence.`;
    dataQuality = 'weak';
    warnings.push('Weak monetization signals indicate low willingness to pay');
  } else {
    explanation = 'Insufficient monetization data.';
    dataQuality = 'insufficient';
    warnings.push('Monetization score is unexpectedly low');
  }

  return {
    factor: 'monetization',
    score,
    weight,
    contribution,
    explanation,
    dataQuality,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Assess overall data quality from factor explanations
 */
function assessDataQuality(
  factorExplanations: FactorExplanation[],
  breakdown: ScoreBreakdown
) {
  const strongFactors = factorExplanations.filter((f) => f.dataQuality === 'strong').length;
  const insufficientFactors = factorExplanations.filter((f) => f.dataQuality === 'insufficient').length;

  const gaps: string[] = [];

  // Collect all warnings
  factorExplanations.forEach((f) => {
    if (f.warnings) {
      gaps.push(...f.warnings);
    }
  });

  // Check audience clarity
  if (breakdown.audienceClarity === null || breakdown.audienceClarity < SCORE_THRESHOLDS.moderate) {
    gaps.push('Audience clarity is weak or unavailable');
  }

  return {
    strongFactors,
    insufficientFactors,
    gaps,
  };
}

/**
 * Determine confidence level based on data quality
 */
function determineConfidence(dataQuality: {
  strongFactors: number;
  insufficientFactors: number;
}): 'high' | 'medium' | 'low' {
  if (
    dataQuality.strongFactors >= CONFIDENCE_THRESHOLDS.high.minStrongFactors &&
    dataQuality.insufficientFactors <= CONFIDENCE_THRESHOLDS.high.maxInsufficientFactors
  ) {
    return 'high';
  }

  if (
    dataQuality.strongFactors >= CONFIDENCE_THRESHOLDS.medium.minStrongFactors &&
    dataQuality.insufficientFactors <= CONFIDENCE_THRESHOLDS.medium.maxInsufficientFactors
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Compute audience clarity modifier (informational, not used in score calculation)
 */
function computeAudienceClarityModifier(audienceClarity: number | null): string {
  if (audienceClarity === null) {
    return 'Audience clarity unavailable';
  }

  if (audienceClarity >= SCORE_THRESHOLDS.strong) {
    return 'Strong audience clarity improves go-to-market confidence';
  } else if (audienceClarity >= SCORE_THRESHOLDS.moderate) {
    return 'Moderate audience clarity - further research recommended';
  } else {
    return 'Weak audience clarity - target market needs refinement';
  }
}

/**
 * Generate human-readable summary explanation
 */
function generateSummary(
  overallScore: number,
  confidence: 'high' | 'medium' | 'low',
  factorExplanations: FactorExplanation[],
  dataQuality: { strongFactors: number; insufficientFactors: number; gaps: string[] },
  audienceClarityModifier: string
): string {
  const parts: string[] = [];

  // Overall assessment
  if (overallScore >= SCORE_THRESHOLDS.strong) {
    parts.push(
      `Strong opportunity with an overall score of ${overallScore}/100.`
    );
  } else if (overallScore >= SCORE_THRESHOLDS.moderate) {
    parts.push(
      `Moderate opportunity with an overall score of ${overallScore}/100.`
    );
  } else {
    parts.push(
      `Weak opportunity with an overall score of ${overallScore}/100.`
    );
  }

  // Confidence
  parts.push(
    `Confidence: ${confidence} (${dataQuality.strongFactors}/4 factors have strong data${dataQuality.insufficientFactors > 0 ? `, ${dataQuality.insufficientFactors} insufficient` : ''}).`
  );

  // Key strengths (top 2 contributing factors)
  const sortedFactors = [...factorExplanations].sort((a, b) => b.contribution - a.contribution);
  const topFactors = sortedFactors.slice(0, 2).filter((f) => f.contribution > 0);

  if (topFactors.length > 0) {
    const topFactorNames = topFactors.map((f) => `${f.factor} (${f.contribution}pts)`).join(', ');
    parts.push(`Key drivers: ${topFactorNames}.`);
  }

  // Data quality warnings
  if (dataQuality.insufficientFactors > 0) {
    parts.push(
      `⚠️ ${dataQuality.insufficientFactors} factor${dataQuality.insufficientFactors > 1 ? 's have' : ' has'} insufficient data, limiting scoring accuracy.`
    );
  }

  // Audience clarity note
  parts.push(audienceClarityModifier + '.');

  return parts.join(' ');
}
