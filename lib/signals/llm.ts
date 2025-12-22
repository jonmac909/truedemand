import Anthropic from '@anthropic-ai/sdk';

/**
 * LLM-assisted analysis using Claude
 * Structured JSON outputs with deterministic temperature
 */

interface PainPoint {
  description: string;
  frequency: number; // How many times mentioned
  intensity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[]; // Citations (post IDs, comment IDs, etc.)
  keywords: string[];
}

interface PainPointAnalysis {
  pain_points: PainPoint[];
  overall_pain_intensity: 'low' | 'medium' | 'high' | 'critical';
  pain_score: number; // 0-100
  explanation: string;
  llm_input: {
    prompt: string;
    model: string;
    temperature: number;
  };
  llm_output: {
    raw_response: string;
    tokens_used: number;
  };
  analyzed_at: string;
}

interface AudienceClarityAnalysis {
  clarity_score: number; // 0-100
  target_audience: string;
  audience_segments: Array<{
    segment: string;
    size_estimate: 'small' | 'medium' | 'large';
    characteristics: string[];
  }>;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  llm_input: {
    prompt: string;
    model: string;
    temperature: number;
  };
  llm_output: {
    raw_response: string;
    tokens_used: number;
  };
  analyzed_at: string;
}

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
 * Analyze pain points from Reddit/TikTok content using Claude
 */
export async function analyzePainPoints(content: {
  posts: Array<{ id: string; title: string; text: string; score: number }>;
  comments: Array<{ id: string; text: string; score: number }>;
  niche: string;
}): Promise<PainPointAnalysis> {
  const client = getClaudeClient();

  // Construct prompt with actual content
  const contentSample = [
    ...content.posts.slice(0, 10).map((p) => `POST[${p.id}]: ${p.title}\n${p.text}`),
    ...content.comments.slice(0, 20).map((c) => `COMMENT[${c.id}]: ${c.text}`),
  ].join('\n\n');

  const prompt = `You are analyzing discussions about "${content.niche}" to identify pain points and unmet needs.

Here is a sample of posts and comments:

${contentSample}

Analyze this content and extract the top pain points. For each pain point:
1. Describe the specific problem or frustration
2. Count approximate frequency (how many times mentioned)
3. Rate intensity (low, medium, high, critical)
4. Provide evidence IDs (post/comment references)
5. Extract relevant keywords

Return your analysis as a JSON object with this structure:
{
  "pain_points": [
    {
      "description": "Clear description of the pain point",
      "frequency": 5,
      "intensity": "high",
      "evidence": ["POST[id1]", "COMMENT[id2]"],
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "overall_pain_intensity": "high",
  "pain_score": 75,
  "explanation": "Summary of findings"
}

Return ONLY valid JSON, no markdown or explanation.`;

  const model = 'claude-3-5-sonnet-20241022';
  const temperature = 0.2; // Deterministic

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    const analysis = JSON.parse(rawResponse);

    return {
      pain_points: analysis.pain_points || [],
      overall_pain_intensity: analysis.overall_pain_intensity || 'low',
      pain_score: analysis.pain_score || 0,
      explanation: analysis.explanation || '',
      llm_input: {
        prompt,
        model,
        temperature,
      },
      llm_output: {
        raw_response: rawResponse,
        tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      },
      analyzed_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Failed to analyze pain points with Claude:', error);

    // Return "insufficient data" structure
    return {
      pain_points: [],
      overall_pain_intensity: 'low',
      pain_score: 0,
      explanation: 'LLM analysis unavailable',
      llm_input: {
        prompt,
        model,
        temperature,
      },
      llm_output: {
        raw_response: error.message || 'Error',
        tokens_used: 0,
      },
      analyzed_at: new Date().toISOString(),
    };
  }
}

/**
 * Analyze audience clarity from content patterns
 */
export async function analyzeAudienceClarity(content: {
  posts: Array<{ id: string; title: string; text: string; author: string }>;
  comments: Array<{ id: string; text: string; author: string }>;
  subreddits?: string[];
  tiktokHashtags?: string[];
  niche: string;
}): Promise<AudienceClarityAnalysis> {
  const client = getClaudeClient();

  // Construct prompt
  const contentSample = [
    ...content.posts.slice(0, 10).map((p) => `POST by ${p.author}: ${p.title}\n${p.text}`),
    ...content.comments.slice(0, 20).map((c) => `COMMENT by ${c.author}: ${c.text}`),
  ].join('\n\n');

  const contextInfo = [];
  if (content.subreddits && content.subreddits.length > 0) {
    contextInfo.push(`Subreddits: ${content.subreddits.join(', ')}`);
  }
  if (content.tiktokHashtags && content.tiktokHashtags.length > 0) {
    contextInfo.push(`TikTok Hashtags: ${content.tiktokHashtags.slice(0, 10).join(', ')}`);
  }

  const prompt = `You are analyzing discussions about "${content.niche}" to understand the target audience.

Context:
${contextInfo.join('\n')}

Sample content:
${contentSample}

Analyze who the target audience is. Identify:
1. Clarity score (0-100): How clearly defined is this audience?
2. Target audience description
3. Audience segments with size estimates and characteristics
4. Confidence in the analysis

Return your analysis as a JSON object with this structure:
{
  "clarity_score": 75,
  "target_audience": "Brief description of who they are",
  "audience_segments": [
    {
      "segment": "Segment name",
      "size_estimate": "medium",
      "characteristics": ["characteristic1", "characteristic2"]
    }
  ],
  "confidence": "high",
  "explanation": "Summary of findings"
}

Return ONLY valid JSON, no markdown or explanation.`;

  const model = 'claude-3-5-sonnet-20241022';
  const temperature = 0.2; // Deterministic

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    const analysis = JSON.parse(rawResponse);

    return {
      clarity_score: analysis.clarity_score || 0,
      target_audience: analysis.target_audience || 'Unknown',
      audience_segments: analysis.audience_segments || [],
      confidence: analysis.confidence || 'low',
      explanation: analysis.explanation || '',
      llm_input: {
        prompt,
        model,
        temperature,
      },
      llm_output: {
        raw_response: rawResponse,
        tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      },
      analyzed_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Failed to analyze audience clarity with Claude:', error);

    // Return "insufficient data" structure
    return {
      clarity_score: 0,
      target_audience: 'Unknown',
      audience_segments: [],
      confidence: 'low',
      explanation: 'LLM analysis unavailable',
      llm_input: {
        prompt,
        model,
        temperature,
      },
      llm_output: {
        raw_response: error.message || 'Error',
        tokens_used: 0,
      },
      analyzed_at: new Date().toISOString(),
    };
  }
}
