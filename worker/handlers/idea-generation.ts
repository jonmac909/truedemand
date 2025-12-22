import type { Job } from '../../lib/db/jobs';
import { updateJobProgress } from '../../lib/db/jobs';
import { supabase } from '../../lib/supabase/client';

/**
 * Idea generation job handler that creates product ideas from validated market gaps.
 *
 * Input: { validation_id: string }
 * Output: { idea_id: string, title: string }
 *
 * Steps:
 * 1. Fetch validation results
 * 2. Analyze gaps and opportunities
 * 3. Generate 1 product idea
 * 4. Store idea in database
 */
export async function handleIdeaGeneration(job: Job): Promise<Record<string, any>> {
  const { validation_id } = job.input_data;

  if (!validation_id) {
    throw new Error('validation_id is required in input_data');
  }

  await updateJobProgress(job.id, 0, 'Starting idea generation');

  // Step 1: Fetch validation data
  await updateJobProgress(job.id, 15, 'Fetching validation results...');
  const { data: validation, error: validationError } = await supabase
    .from('validations')
    .select('*, market_nodes!inner(name, description, project_id)')
    .eq('id', validation_id)
    .single();

  if (validationError || !validation) {
    throw new Error(`Failed to fetch validation: ${validationError?.message || 'Not found'}`);
  }

  await sleep(1000);

  // Step 2: Fetch validation sources for context
  await updateJobProgress(job.id, 30, 'Analyzing validated pain points and opportunities...');
  const { data: sources } = await supabase
    .from('validation_sources')
    .select('*')
    .eq('validation_id', validation_id);

  await sleep(1500);

  // Step 3: Generate product idea
  await updateJobProgress(job.id, 55, '[MOCK] Synthesizing product concept from market gaps...');
  await sleep(1800);

  const idea = generateMockIdea(
    validation.market_nodes.name,
    validation.market_nodes.description,
    validation.overall_score,
    validation.analysis_data,
    sources || []
  );

  await updateJobProgress(job.id, 75, `Generated idea: "${idea.title}"`);
  await sleep(1000);

  // Step 4: Store idea in database
  await updateJobProgress(job.id, 90, 'Storing product idea in database...');

  const ideaData = {
    project_id: validation.market_nodes.project_id,
    validation_id: validation_id,
    title: idea.title,
    target_persona: idea.targetPersona,
    value_proposition: idea.valueProposition,
    differentiators: idea.differentiators,
    analysis_data: {
      mocked: true,
      generation_timestamp: new Date().toISOString(),
      validation_score_used: validation.overall_score,
      key_insights: idea.keyInsights,
    },
  };

  const { data: storedIdea, error: insertError } = await supabase
    .from('ideas')
    .insert(ideaData)
    .select()
    .single();

  if (insertError || !storedIdea) {
    throw new Error(`Failed to store idea: ${insertError?.message || 'Unknown error'}`);
  }

  await updateJobProgress(job.id, 100, 'Idea generation complete');

  return {
    idea_id: storedIdea.id,
    title: idea.title,
    target_persona: idea.targetPersona,
    value_proposition: idea.valueProposition,
    mocked: true,
  };
}

// ============================================================
// MOCK IDEA GENERATION
// ============================================================

interface GeneratedIdea {
  title: string;
  targetPersona: string;
  valueProposition: string;
  differentiators: string[];
  keyInsights: string[];
}

function generateMockIdea(
  subNicheName: string,
  subNicheDescription: string | null,
  validationScore: number,
  analysisData: any,
  sources: any[]
): GeneratedIdea {
  // Extract key terms from sub-niche name for idea generation
  const hash = simpleHash(subNicheName);
  const industryTerms = extractIndustryTerms(subNicheName);

  // Generate idea components
  const approach = getApproachVariant(hash);
  const title = `${approach} for ${industryTerms.target}`;

  const targetPersona = generateTargetPersona(industryTerms, hash);
  const valueProposition = generateValueProposition(industryTerms, approach, validationScore);
  const differentiators = generateDifferentiators(analysisData, hash);
  const keyInsights = generateKeyInsights(sources, validationScore);

  return {
    title,
    targetPersona,
    valueProposition,
    differentiators,
    keyInsights,
  };
}

function extractIndustryTerms(subNicheName: string): { target: string; industry: string; context: string } {
  // Simple extraction - in real version, this would use NLP
  const lower = subNicheName.toLowerCase();

  let target = 'small businesses';
  let industry = 'general';
  let context = '';

  if (lower.includes('restaurant')) {
    target = 'independent restaurants';
    industry = 'food service';
    context = '1-3 locations';
  } else if (lower.includes('healthcare') || lower.includes('clinic')) {
    target = 'small healthcare clinics';
    industry = 'healthcare';
    context = '5-50 staff';
  } else if (lower.includes('home service') || lower.includes('contractor')) {
    target = 'home service businesses';
    industry = 'field services';
    context = 'plumbers, electricians, HVAC';
  } else if (lower.includes('retail')) {
    target = 'independent retailers';
    industry = 'retail';
    context = 'brick and mortar stores';
  }

  return { target, industry, context };
}

function getApproachVariant(hash: number): string {
  const variants = [
    'AI-Powered Platform',
    'Smart Automation Tool',
    'Integrated Dashboard',
    'Mobile-First Solution',
    'All-in-One System',
  ];
  return variants[hash % variants.length];
}

function generateTargetPersona(terms: { target: string; industry: string; context: string }, hash: number): string {
  const sizeDescriptor = ['small', 'independent', 'family-owned', 'boutique'][hash % 4];
  const painPoint = ['limited time', 'tight budgets', 'small teams', 'growing operations'][(hash + 1) % 4];
  const techLevel = ['tech-savvy', 'looking for simple solutions', 'wanting better tools', 'frustrated with complex software'][(hash + 2) % 4];

  return `${sizeDescriptor.charAt(0).toUpperCase() + sizeDescriptor.slice(1)} ${terms.target} with ${painPoint}, ${techLevel}. ${terms.context ? `Typically ${terms.context}.` : ''} Decision-makers are owner-operators who value ROI and ease of use.`;
}

function generateValueProposition(terms: { target: string }, approach: string, validationScore: number): string {
  const benefit = validationScore > 70
    ? 'dramatically reduce operational overhead and increase profitability'
    : validationScore > 50
    ? 'streamline daily operations and save time'
    : 'solve critical pain points efficiently';

  return `${approach} that helps ${terms.target} ${benefit} through automated workflows, intelligent insights, and seamless integrations. Delivers measurable ROI within the first 30 days while remaining affordable and easy to implement.`;
}

function generateDifferentiators(analysisData: any, hash: number): string[] {
  const baseOptions = [
    'Purpose-built for the specific needs of the target market, not a generic enterprise solution',
    'Pricing designed for small businesses ($50-150/month range) with transparent, simple plans',
    'Mobile-first design that works seamlessly in the field or on the floor',
    '10-minute setup with no technical knowledge required',
    'Integrates with existing tools they already use (POS, accounting, communication)',
    'Dedicated support with real humans who understand the industry',
    'AI-powered recommendations that get smarter over time',
    'Built-in best practices from successful operators in the same industry',
  ];

  // Select 3-4 differentiators based on hash
  const count = 3 + (hash % 2);
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(baseOptions[(hash + i) % baseOptions.length]);
  }

  return selected;
}

function generateKeyInsights(sources: any[], validationScore: number): string[] {
  const insights: string[] = [];

  // Extract insights from mocked validation sources
  if (validationScore > 70) {
    insights.push('Strong market validation signals indicate high product-market fit potential');
  }

  insights.push('Existing solutions are either too expensive or too complex for the target market');
  insights.push('Customers are actively discussing pain points and looking for better alternatives');

  if (validationScore > 60) {
    insights.push('Growing search trends suggest increasing market awareness and demand');
  }

  insights.push('Low competition provides opportunity for rapid market share capture');

  return insights;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
