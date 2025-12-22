import type { Job } from '../../lib/db/jobs';
import { updateJobProgress } from '../../lib/db/jobs';
import { supabase } from '../../lib/supabase/client';

/**
 * Validation job handler that analyzes a sub-niche with mocked data sources.
 *
 * Input: { market_node_id: string }
 * Output: { validation_id: string, overall_score: number, signals: {...} }
 *
 * Steps:
 * 1. Fetch sub-niche details
 * 2. Mock Reddit signal analysis
 * 3. Mock Trends data analysis
 * 4. Compute aggregated score (0-100)
 * 5. Store validation results in DB
 */
export async function handleValidation(job: Job): Promise<Record<string, any>> {
  const { market_node_id } = job.input_data;

  if (!market_node_id) {
    throw new Error('market_node_id is required in input_data');
  }

  await updateJobProgress(job.id, 0, 'Starting validation analysis');

  // Step 1: Fetch sub-niche details
  await updateJobProgress(job.id, 10, 'Fetching sub-niche data from database...');
  const { data: marketNode, error: fetchError } = await supabase
    .from('market_nodes')
    .select('*')
    .eq('id', market_node_id)
    .single();

  if (fetchError || !marketNode) {
    throw new Error(`Failed to fetch market node: ${fetchError?.message || 'Not found'}`);
  }

  if (marketNode.node_type !== 'sub_niche') {
    throw new Error('Can only validate sub-niches, not root markets');
  }

  await sleep(800);

  // Step 2: Mock Reddit signal analysis
  await updateJobProgress(job.id, 25, '[MOCK] Scanning Reddit discussions and forum posts...');
  await sleep(1500);

  const redditScore = mockRedditAnalysis(marketNode.name);
  await updateJobProgress(
    job.id,
    40,
    `[MOCK] Found ${redditScore.mentionCount} Reddit mentions, ${redditScore.painPointThreads} pain point threads`
  );
  await sleep(1000);

  // Step 3: Mock Trends data analysis
  await updateJobProgress(job.id, 55, '[MOCK] Analyzing Google Trends and search volume data...');
  await sleep(1500);

  const trendsScore = mockTrendsAnalysis(marketNode.name);
  await updateJobProgress(
    job.id,
    70,
    `[MOCK] Search volume: ${trendsScore.searchVolume}/month, Growth: ${trendsScore.growthRate}%`
  );
  await sleep(1000);

  // Step 4: Mock competition and financial signals
  await updateJobProgress(job.id, 80, '[MOCK] Evaluating competition landscape and financial indicators...');
  await sleep(1200);

  const competitionScore = mockCompetitionAnalysis(marketNode.name);
  const financialScore = mockFinancialAnalysis(marketNode.name);

  // Step 5: Compute overall score
  const overallScore = Math.round(
    (redditScore.score * 0.3 + trendsScore.score * 0.3 + competitionScore.score * 0.2 + financialScore.score * 0.2)
  );

  await updateJobProgress(job.id, 90, `Computed overall validation score: ${overallScore}/100`);
  await sleep(800);

  // Step 6: Store validation in database
  await updateJobProgress(job.id, 95, 'Storing validation results in database...');

  const validationData = {
    project_id: marketNode.project_id,
    market_node_id: market_node_id,
    overall_score: overallScore,
    overall_explanation: generateOverallExplanation(overallScore, redditScore, trendsScore, competitionScore, financialScore),
    search_score: trendsScore.score,
    social_score: redditScore.score,
    competition_score: competitionScore.score,
    financial_score: financialScore.score,
    analysis_data: {
      mocked: true,
      reddit_data: redditScore.details,
      trends_data: trendsScore.details,
      competition_data: competitionScore.details,
      financial_data: financialScore.details,
    },
  };

  const { data: validation, error: insertError } = await supabase
    .from('validations')
    .insert(validationData)
    .select()
    .single();

  if (insertError || !validation) {
    throw new Error(`Failed to store validation: ${insertError?.message || 'Unknown error'}`);
  }

  // Insert validation sources (citations)
  await insertValidationSources(validation.id, redditScore, trendsScore, competitionScore, financialScore);

  await updateJobProgress(job.id, 100, 'Validation analysis complete');

  return {
    validation_id: validation.id,
    overall_score: overallScore,
    signals: {
      search: trendsScore.score,
      social: redditScore.score,
      competition: competitionScore.score,
      financial: financialScore.score,
    },
    mocked: true,
  };
}

// ============================================================
// MOCKING FUNCTIONS
// ============================================================

interface MockScore {
  score: number;
  details: Record<string, any>;
  mentionCount?: number;
  painPointThreads?: number;
  searchVolume?: number;
  growthRate?: number;
}

function mockRedditAnalysis(subNicheName: string): MockScore {
  // Generate consistent but pseudo-random data based on sub-niche name
  const hash = simpleHash(subNicheName);
  const mentionCount = 50 + (hash % 200); // 50-250
  const painPointThreads = 5 + (hash % 25); // 5-30
  const avgUpvotes = 10 + (hash % 50); // 10-60
  const score = Math.min(95, 40 + (hash % 50)); // 40-90

  return {
    score,
    mentionCount,
    painPointThreads,
    details: {
      total_mentions: mentionCount,
      pain_point_threads: painPointThreads,
      avg_upvotes: avgUpvotes,
      top_subreddits: ['r/entrepreneur', 'r/smallbusiness', 'r/SaaS'],
      sentiment: score > 70 ? 'positive' : score > 50 ? 'neutral' : 'mixed',
    },
  };
}

function mockTrendsAnalysis(subNicheName: string): MockScore {
  const hash = simpleHash(subNicheName + '_trends');
  const searchVolume = 1000 + (hash % 20000); // 1K-21K monthly
  const growthRate = -10 + (hash % 50); // -10% to +40%
  const score = Math.min(95, 35 + (hash % 55)); // 35-90

  return {
    score,
    searchVolume,
    growthRate,
    details: {
      monthly_searches: searchVolume,
      yoy_growth: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      trend_direction: growthRate > 10 ? 'rising' : growthRate < -5 ? 'declining' : 'stable',
      related_keywords: ['saas tools', 'business software', 'automation'],
    },
  };
}

function mockCompetitionAnalysis(subNicheName: string): MockScore {
  const hash = simpleHash(subNicheName + '_comp');
  const competitorCount = 3 + (hash % 15); // 3-18 competitors
  const score = Math.min(95, 40 + (hash % 50)); // 40-90

  return {
    score,
    details: {
      competitor_count: competitorCount,
      market_saturation: score > 70 ? 'low' : score > 50 ? 'moderate' : 'high',
      feature_gaps: ['better UX', 'mobile-first', 'integrations'],
      avg_competitor_rating: 3.2 + (hash % 15) / 10, // 3.2-4.7
    },
  };
}

function mockFinancialAnalysis(subNicheName: string): MockScore {
  const hash = simpleHash(subNicheName + '_finance');
  const avgMonthlySpend = 50 + (hash % 400); // $50-$450
  const score = Math.min(95, 45 + (hash % 45)); // 45-90

  return {
    score,
    details: {
      estimated_tam: `$${(1 + (hash % 5))}B`,
      avg_monthly_spend: `$${avgMonthlySpend}`,
      willingness_to_pay: score > 70 ? 'high' : score > 50 ? 'moderate' : 'uncertain',
      pricing_sensitivity: score < 60 ? 'high' : 'moderate',
    },
  };
}

function generateOverallExplanation(
  overallScore: number,
  reddit: MockScore,
  trends: MockScore,
  competition: MockScore,
  financial: MockScore
): string {
  const strength = overallScore >= 70 ? 'Strong' : overallScore >= 50 ? 'Moderate' : 'Weak';
  const growthRate = trends.growthRate || 0;
  const trend = growthRate > 10 ? 'growing rapidly' : growthRate > 0 ? 'growing steadily' : 'stable or declining';

  return `${strength} validation signals across multiple dimensions. Market shows ${trend} with ${trends.searchVolume} monthly searches (${growthRate > 0 ? '+' : ''}${growthRate}% YoY). Social proof indicates ${reddit.mentionCount} Reddit mentions with ${reddit.painPointThreads} active pain point discussions. Competition analysis shows ${competition.details.market_saturation} saturation with opportunities for differentiation. Financial indicators suggest ${financial.details.willingness_to_pay} willingness to pay. [MOCKED DATA]`;
}

async function insertValidationSources(
  validationId: string,
  reddit: MockScore,
  trends: MockScore,
  competition: MockScore,
  financial: MockScore
): Promise<void> {
  const sources = [
    {
      validation_id: validationId,
      source_type: 'social',
      citation: '[MOCK] Reddit analysis - r/entrepreneur, r/smallbusiness, r/SaaS',
      evidence: `Found ${reddit.mentionCount} mentions across ${reddit.details.top_subreddits.length} subreddits with ${reddit.painPointThreads} pain point threads. Average ${reddit.details.avg_upvotes} upvotes per discussion.`,
      metadata: reddit.details,
    },
    {
      validation_id: validationId,
      source_type: 'search',
      citation: '[MOCK] Google Trends analysis - 12 month period',
      evidence: `Monthly search volume of ${trends.searchVolume} with ${trends.growthRate}% year-over-year growth. Trend is ${trends.details.trend_direction}.`,
      metadata: trends.details,
    },
    {
      validation_id: validationId,
      source_type: 'competition',
      citation: '[MOCK] Competitor landscape analysis',
      evidence: `Identified ${competition.details.competitor_count} direct competitors with ${competition.details.market_saturation} market saturation. Average competitor rating: ${competition.details.avg_competitor_rating.toFixed(1)}/5.0.`,
      metadata: competition.details,
    },
    {
      validation_id: validationId,
      source_type: 'financial',
      citation: '[MOCK] Market size and pricing research',
      evidence: `Estimated TAM of ${financial.details.estimated_tam} with average customer spending ${financial.details.avg_monthly_spend}/month. Willingness to pay is ${financial.details.willingness_to_pay}.`,
      metadata: financial.details,
    },
  ];

  const { error } = await supabase.from('validation_sources').insert(sources);

  if (error) {
    console.error('Failed to insert validation sources:', error);
    // Don't throw - sources are supplementary
  }
}

// Simple hash function for consistent pseudo-random generation
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
