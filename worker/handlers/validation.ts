import type { Job } from '../../lib/db/jobs';
import { updateJobProgress } from '../../lib/db/jobs';
import { supabase } from '../../lib/supabase/client';
import { fetchRedditSignals, extractPainIndicators } from '../../lib/signals/reddit';
import { fetchTrendsSignals } from '../../lib/signals/trends';
import { fetchTikTokSignals } from '../../lib/signals/tiktok';
import { analyzePainPoints, analyzeAudienceClarity } from '../../lib/signals/llm';
import { scoreValidationInitial } from '../../lib/scoring';

/**
 * Validation job handler with REAL data sources
 *
 * Input: { market_node_id: string }
 * Output: { validation_id: string, overall_score: number, signals: {...} }
 *
 * Steps:
 * 1. Fetch sub-niche details
 * 2. Fetch Reddit signals
 * 3. Fetch Google Trends signals (12-month + 5-year)
 * 4. Fetch TikTok signals via Apify
 * 5. LLM-assisted pain point extraction
 * 6. LLM-assisted audience clarity analysis
 * 7. Compute sub-scores (trend, pain, competition, monetization, audience_clarity)
 * 8. Store all raw signals and validation results
 */
export async function handleValidation(job: Job): Promise<Record<string, any>> {
  const { market_node_id } = job.input_data;

  if (!market_node_id) {
    throw new Error('market_node_id is required in input_data');
  }

  await updateJobProgress(job.id, 0, 'Starting real validation analysis');

  // Step 1: Fetch sub-niche details
  await updateJobProgress(job.id, 5, 'Fetching sub-niche data from database...');
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

  const niche = marketNode.name;

  // Step 2: Fetch Reddit signals
  await updateJobProgress(job.id, 15, `Fetching Reddit discussions for "${niche}"...`);
  let redditSignal;
  try {
    redditSignal = await fetchRedditSignals(niche, {
      maxPosts: 50,
      maxCommentsPerPost: 10,
      timeRange: 'month',
    });
    await updateJobProgress(
      job.id,
      25,
      `Found ${redditSignal.total_posts} Reddit posts, ${redditSignal.total_comments} comments`
    );
  } catch (error: any) {
    await updateJobProgress(job.id, 25, `Reddit fetch failed: ${error.message} - marking insufficient data`);
    redditSignal = null;
  }

  // Step 3: Fetch Google Trends signals
  await updateJobProgress(job.id, 35, `Fetching Google Trends data for "${niche}"...`);
  let trendsSignal;
  try {
    trendsSignal = await fetchTrendsSignals(niche, { geo: 'US' });
    await updateJobProgress(
      job.id,
      45,
      `Trends: ${trendsSignal.twelveMonth.trend} (${trendsSignal.twelveMonth.growthRate}% growth)`
    );
  } catch (error: any) {
    await updateJobProgress(job.id, 45, `Trends fetch failed: ${error.message} - marking insufficient data`);
    trendsSignal = null;
  }

  // Step 4: Fetch TikTok signals via Apify
  await updateJobProgress(job.id, 55, `Fetching TikTok signals via Apify for "${niche}"...`);
  let tiktokSignal;
  try {
    tiktokSignal = await fetchTikTokSignals(niche, { maxVideos: 30 });
    await updateJobProgress(
      job.id,
      65,
      tiktokSignal.total_videos > 0
        ? `Found ${tiktokSignal.total_videos} TikTok videos, ${tiktokSignal.total_views} total views`
        : 'TikTok data unavailable'
    );
  } catch (error: any) {
    await updateJobProgress(job.id, 65, `TikTok fetch failed: ${error.message} - marking insufficient data`);
    tiktokSignal = null;
  }

  // Step 5: LLM-assisted pain point extraction
  await updateJobProgress(job.id, 70, 'Analyzing pain points with Claude LLM...');
  let painAnalysis;
  try {
    if (redditSignal && redditSignal.total_posts > 0) {
      const painIndicators = extractPainIndicators(redditSignal);
      painAnalysis = await analyzePainPoints({
        posts: redditSignal.posts.map((p) => ({
          id: p.id,
          title: p.title,
          text: p.selftext,
          score: p.score,
        })),
        comments: redditSignal.comments.map((c) => ({
          id: c.id,
          text: c.body,
          score: c.score,
        })),
        niche,
      });
      await updateJobProgress(
        job.id,
        75,
        `Pain analysis: ${painAnalysis.pain_points.length} pain points identified (${painAnalysis.overall_pain_intensity} intensity)`
      );
    } else {
      painAnalysis = null;
      await updateJobProgress(job.id, 75, 'Insufficient Reddit data for pain analysis');
    }
  } catch (error: any) {
    await updateJobProgress(job.id, 75, `Pain analysis failed: ${error.message}`);
    painAnalysis = null;
  }

  // Step 6: LLM-assisted audience clarity analysis
  await updateJobProgress(job.id, 80, 'Analyzing audience clarity with Claude LLM...');
  let audienceAnalysis;
  try {
    if (redditSignal && redditSignal.total_posts > 0) {
      audienceAnalysis = await analyzeAudienceClarity({
        posts: redditSignal.posts.map((p) => ({
          id: p.id,
          title: p.title,
          text: p.selftext,
          author: p.author,
        })),
        comments: redditSignal.comments.map((c) => ({
          id: c.id,
          text: c.body,
          author: c.author,
        })),
        subreddits: redditSignal.subreddits,
        tiktokHashtags: tiktokSignal?.top_hashtags.map((h) => h.tag),
        niche,
      });
      await updateJobProgress(
        job.id,
        85,
        `Audience clarity: ${audienceAnalysis.clarity_score}/100 (${audienceAnalysis.confidence} confidence)`
      );
    } else {
      audienceAnalysis = null;
      await updateJobProgress(job.id, 85, 'Insufficient data for audience analysis');
    }
  } catch (error: any) {
    await updateJobProgress(job.id, 85, `Audience analysis failed: ${error.message}`);
    audienceAnalysis = null;
  }

  // Step 7: Compute sub-scores
  await updateJobProgress(job.id, 90, 'Computing validation sub-scores...');

  const scores = computeValidationScores({
    trendsSignal,
    redditSignal,
    tiktokSignal,
    painAnalysis,
    audienceAnalysis,
  });

  // Overall score (weighted average)
  const overallScore = Math.round(
    scores.trend * 0.25 +
      scores.pain * 0.30 +
      scores.competition * 0.20 +
      scores.monetization * 0.25
  );

  const overallExplanation = generateExplanation(scores, {
    trendsSignal,
    redditSignal,
    tiktokSignal,
    painAnalysis,
    audienceAnalysis,
  });

  // Step 8: Store validation in database
  await updateJobProgress(job.id, 95, 'Storing validation results in database...');

  const validationData = {
    project_id: marketNode.project_id,
    market_node_id: market_node_id,
    overall_score: overallScore,
    overall_explanation: overallExplanation,
    search_score: scores.trend, // trend → search_score
    social_score: scores.pain, // pain → social_score
    competition_score: scores.competition,
    financial_score: scores.monetization, // monetization → financial_score
    analysis_data: {
      audience_clarity: scores.audience_clarity,
      audience_analysis: audienceAnalysis || { clarity_score: 0, explanation: 'Insufficient data' },
      pain_analysis: painAnalysis || { pain_score: 0, explanation: 'Insufficient data' },
      data_sources_available: {
        reddit: !!redditSignal,
        trends: !!trendsSignal,
        tiktok: !!tiktokSignal,
      },
      fetched_at: new Date().toISOString(),
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

  // Store raw signals in validation_sources
  await storeRawSignals(validation.id, {
    redditSignal,
    trendsSignal,
    tiktokSignal,
    painAnalysis,
    audienceAnalysis,
  });

  // Step 9: Compute B2 Explainable Score
  await updateJobProgress(job.id, 97, 'Computing explainable opportunity score (B2)...');

  let scoringResult;
  try {
    scoringResult = await scoreValidationInitial(validation.id);
    await updateJobProgress(
      job.id,
      99,
      `Final score: ${scoringResult.overallScore}/100 (${scoringResult.confidence} confidence)`
    );
  } catch (error: any) {
    // If B2 scoring fails, log error but don't fail the entire validation
    console.error('B2 scoring failed:', error);
    await updateJobProgress(job.id, 99, `B2 scoring failed: ${error.message} - using B1 scores`);
    scoringResult = null;
  }

  await updateJobProgress(job.id, 100, 'Real validation analysis complete');

  return {
    validation_id: validation.id,
    overall_score: scoringResult?.overallScore ?? overallScore,
    confidence: scoringResult?.confidence ?? 'medium',
    signals: {
      trend: scores.trend,
      pain: scores.pain,
      competition: scores.competition,
      monetization: scores.monetization,
      audience_clarity: scores.audience_clarity,
    },
    data_sources: {
      reddit: !!redditSignal,
      trends: !!trendsSignal,
      tiktok: !!tiktokSignal,
    },
    scoring: scoringResult
      ? {
          breakdown: scoringResult.breakdown,
          dataQuality: scoringResult.dataQuality,
          weightsUsed: scoringResult.weightsUsed,
        }
      : null,
  };
}

/**
 * Compute validation sub-scores from raw signals
 */
function computeValidationScores(data: {
  trendsSignal: any;
  redditSignal: any;
  tiktokSignal: any;
  painAnalysis: any;
  audienceAnalysis: any;
}): {
  trend: number;
  pain: number;
  competition: number;
  monetization: number;
  audience_clarity: number;
} {
  // Trend score (0-100)
  let trendScore = 0;
  if (data.trendsSignal && data.trendsSignal.twelveMonth) {
    const { averageInterest, growthRate, trend } = data.trendsSignal.twelveMonth;

    // Base score from average interest
    let score = Math.min(averageInterest, 100);

    // Adjust for growth
    if (trend === 'rising') score += 20;
    else if (trend === 'declining') score -= 20;

    // Bonus for strong growth
    if (growthRate > 50) score += 10;
    else if (growthRate > 100) score += 20;

    trendScore = Math.max(0, Math.min(100, score));
  }

  // Pain score (0-100) - from LLM analysis
  let painScore = 0;
  if (data.painAnalysis) {
    painScore = data.painAnalysis.pain_score || 0;
  }

  // Competition score (0-100) - inverse of market saturation
  let competitionScore = 50; // Default middle
  if (data.redditSignal) {
    // More subreddits = more fragmented = less competition
    const subredditCount = data.redditSignal.subreddits?.length || 0;
    if (subredditCount > 10) competitionScore = 70; // Low competition
    else if (subredditCount > 5) competitionScore = 60;
    else if (subredditCount < 3) competitionScore = 40; // High competition
  }

  // Monetization likelihood (0-100)
  let monetizationScore = 0;
  if (data.painAnalysis && data.audienceAnalysis) {
    // High pain + clear audience = high monetization potential
    const painIntensity = data.painAnalysis.overall_pain_intensity;
    const audienceClarity = data.audienceAnalysis.clarity_score || 0;

    let score = audienceClarity * 0.5; // Start with audience clarity

    if (painIntensity === 'critical') score += 40;
    else if (painIntensity === 'high') score += 30;
    else if (painIntensity === 'medium') score += 15;

    monetizationScore = Math.min(100, score);
  }

  // Audience clarity (0-100) - from LLM analysis
  let audienceClarityScore = 0;
  if (data.audienceAnalysis) {
    audienceClarityScore = data.audienceAnalysis.clarity_score || 0;
  }

  return {
    trend: Math.round(trendScore),
    pain: Math.round(painScore),
    competition: Math.round(competitionScore),
    monetization: Math.round(monetizationScore),
    audience_clarity: Math.round(audienceClarityScore),
  };
}

/**
 * Generate human-readable explanation of validation results
 */
function generateExplanation(
  scores: any,
  data: any
): string {
  const parts: string[] = [];

  // Overall assessment
  const overallScore = Math.round(
    scores.trend * 0.25 + scores.pain * 0.30 + scores.competition * 0.20 + scores.monetization * 0.25
  );

  if (overallScore >= 70) parts.push('Strong validation signals across multiple dimensions.');
  else if (overallScore >= 50) parts.push('Moderate validation with some promising indicators.');
  else parts.push('Weak validation signals - further research recommended.');

  // Trend analysis
  if (data.trendsSignal && data.trendsSignal.twelveMonth) {
    const { trend, growthRate, averageInterest } = data.trendsSignal.twelveMonth;
    parts.push(
      `Search trend is ${trend} with ${growthRate > 0 ? '+' : ''}${growthRate}% YoY growth (avg interest: ${averageInterest}).`
    );
  } else {
    parts.push('Search trend data: Insufficient data.');
  }

  // Pain analysis
  if (data.painAnalysis) {
    const { pain_points, overall_pain_intensity } = data.painAnalysis;
    parts.push(
      `Identified ${pain_points.length} pain points with ${overall_pain_intensity} overall intensity.`
    );
  } else {
    parts.push('Pain analysis: Insufficient data.');
  }

  // Social proof
  if (data.redditSignal) {
    parts.push(
      `Social proof: ${data.redditSignal.total_posts} Reddit posts across ${data.redditSignal.subreddits.length} subreddits.`
    );
  } else {
    parts.push('Social proof: Insufficient data.');
  }

  // TikTok signals
  if (data.tiktokSignal && data.tiktokSignal.total_videos > 0) {
    parts.push(
      `TikTok signals: ${data.tiktokSignal.total_videos} videos with ${data.tiktokSignal.total_views} total views.`
    );
  } else {
    parts.push('TikTok signals: Insufficient data.');
  }

  // Audience clarity
  if (data.audienceAnalysis) {
    parts.push(
      `Audience clarity: ${data.audienceAnalysis.clarity_score}/100 (${data.audienceAnalysis.confidence} confidence).`
    );
  }

  return parts.join(' ');
}

/**
 * Store raw signals in validation_sources table
 */
async function storeRawSignals(
  validationId: string,
  signals: {
    redditSignal: any;
    trendsSignal: any;
    tiktokSignal: any;
    painAnalysis: any;
    audienceAnalysis: any;
  }
): Promise<void> {
  const sources: any[] = [];

  // Reddit source
  if (signals.redditSignal) {
    sources.push({
      validation_id: validationId,
      source_type: 'social',
      citation: `Reddit search: "${signals.redditSignal.query}" (${signals.redditSignal.total_posts} posts, ${signals.redditSignal.total_comments} comments)`,
      evidence: `Analyzed discussions across ${signals.redditSignal.subreddits.length} subreddits. Top subreddits: ${signals.redditSignal.subreddits.slice(0, 5).join(', ')}.`,
      metadata: {
        platform: 'reddit',
        raw: signals.redditSignal,
        fetched_at: signals.redditSignal.fetched_at,
        query: signals.redditSignal.query,
        reproducible: signals.redditSignal.reproducible,
      },
    });
  }

  // Google Trends source
  if (signals.trendsSignal) {
    sources.push({
      validation_id: validationId,
      source_type: 'search',
      citation: `Google Trends: "${signals.trendsSignal.keyword}" (12-month analysis${signals.trendsSignal.fiveYear ? ' + 5-year' : ''})`,
      evidence: `12-month trend: ${signals.trendsSignal.twelveMonth.trend} (${signals.trendsSignal.twelveMonth.growthRate}% growth). Average interest: ${signals.trendsSignal.twelveMonth.averageInterest}.`,
      metadata: {
        platform: 'google_trends',
        raw: signals.trendsSignal,
        fetched_at: signals.trendsSignal.fetched_at,
        query: signals.trendsSignal.query,
        reproducible: signals.trendsSignal.reproducible,
      },
    });
  }

  // TikTok source
  if (signals.tiktokSignal && signals.tiktokSignal.total_videos > 0) {
    sources.push({
      validation_id: validationId,
      source_type: 'social',
      citation: `TikTok (via Apify): "${signals.tiktokSignal.query}" (${signals.tiktokSignal.total_videos} videos)`,
      evidence: `Total engagement: ${signals.tiktokSignal.total_views} views, ${signals.tiktokSignal.total_likes} likes, ${signals.tiktokSignal.total_comments} comments. Top hashtags: ${signals.tiktokSignal.top_hashtags.slice(0, 5).map((h: any) => h.tag).join(', ')}.`,
      metadata: {
        platform: 'tiktok',
        raw: signals.tiktokSignal,
        fetched_at: signals.tiktokSignal.fetched_at,
        query: signals.tiktokSignal.query,
        reproducible: signals.tiktokSignal.reproducible,
      },
    });
  }

  // LLM Pain Analysis source
  if (signals.painAnalysis) {
    sources.push({
      validation_id: validationId,
      source_type: 'other',
      citation: `LLM Pain Analysis (Claude): ${signals.painAnalysis.pain_points.length} pain points identified`,
      evidence: signals.painAnalysis.explanation,
      metadata: {
        platform: 'llm_claude',
        analysis_type: 'pain_points',
        raw: signals.painAnalysis,
        llm_input: signals.painAnalysis.llm_input,
        llm_output: signals.painAnalysis.llm_output,
        analyzed_at: signals.painAnalysis.analyzed_at,
        reproducible: true,
      },
    });
  }

  // LLM Audience Analysis source
  if (signals.audienceAnalysis) {
    sources.push({
      validation_id: validationId,
      source_type: 'other',
      citation: `LLM Audience Analysis (Claude): ${signals.audienceAnalysis.clarity_score}/100 clarity`,
      evidence: signals.audienceAnalysis.explanation,
      metadata: {
        platform: 'llm_claude',
        analysis_type: 'audience_clarity',
        raw: signals.audienceAnalysis,
        llm_input: signals.audienceAnalysis.llm_input,
        llm_output: signals.audienceAnalysis.llm_output,
        analyzed_at: signals.audienceAnalysis.analyzed_at,
        reproducible: true,
      },
    });
  }

  if (sources.length > 0) {
    const { error } = await supabase.from('validation_sources').insert(sources);

    if (error) {
      console.error('Failed to insert validation sources:', error);
      // Don't throw - sources are supplementary
    }
  }
}
