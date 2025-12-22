'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OpportunityScore } from '@/components/validation/opportunity-score';
import { ScoreFactor } from '@/components/validation/score-factor';
import { CollapsibleSection } from '@/components/validation/collapsible-section';
import { Tabs } from '@/components/validation/tabs';
import { SourceCard } from '@/components/validation/source-card';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface ValidationData {
  id: string;
  overall_score: number;
  overall_explanation: string;
  search_score: number | null;
  social_score: number | null;
  competition_score: number | null;
  financial_score: number | null;
  analysis_data: {
    confidence?: 'high' | 'medium' | 'low';
    weights_used?: {
      trend: number;
      pain: number;
      competition: number;
      monetization: number;
    };
    explanation?: {
      summary: string;
      breakdown: any;
      factorExplanations: Array<{
        factor: string;
        score: number | null;
        weight: number;
        contribution: number;
        explanation: string;
        dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient';
        warnings?: string[];
      }>;
      dataQuality: {
        strongFactors: number;
        insufficientFactors: number;
        gaps: string[];
      };
    };
    data_sources_available?: {
      reddit: boolean;
      trends: boolean;
      tiktok: boolean;
    };
  };
  market_node?: {
    name: string;
    description: string;
  };
}

interface ValidationSource {
  id: string;
  source_type: 'search' | 'social' | 'competition' | 'financial' | 'other';
  citation: string;
  evidence: string;
  metadata: any;
}

export default function ValidationDetailPage() {
  const params = useParams();
  const validationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationData | null>(null);
  const [sources, setSources] = useState<ValidationSource[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!validationId) return;

    const fetchValidation = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data structure
        const mockValidation: ValidationData = {
          id: validationId,
          overall_score: 73,
          overall_explanation: 'Strong validation signals across multiple dimensions. High confidence in market opportunity.',
          search_score: 82,
          social_score: 78,
          competition_score: 65,
          financial_score: 71,
          analysis_data: {
            confidence: 'high',
            weights_used: {
              trend: 0.25,
              pain: 0.30,
              competition: 0.20,
              monetization: 0.25,
            },
            explanation: {
              summary: 'Strong opportunity with an overall score of 73/100. Confidence: high (3/4 factors have strong data). Key drivers: pain (23pts), trend (21pts). Strong audience clarity improves go-to-market confidence.',
              breakdown: {
                trend: 82,
                pain: 78,
                competition: 65,
                monetization: 71,
                audienceClarity: 75,
              },
              factorExplanations: [
                {
                  factor: 'trend',
                  score: 82,
                  weight: 0.25,
                  contribution: 21,
                  explanation: 'Strong upward search trend with solid growth momentum. Market interest is rising consistently over the past 12 months.',
                  dataQuality: 'strong',
                },
                {
                  factor: 'pain',
                  score: 78,
                  weight: 0.30,
                  contribution: 23,
                  explanation: 'Critical pain points identified with high intensity. Users are actively seeking solutions in online communities.',
                  dataQuality: 'strong',
                },
                {
                  factor: 'competition',
                  score: 65,
                  weight: 0.20,
                  contribution: 13,
                  explanation: 'Moderate competition. Market has established players but room for new entrants with differentiation.',
                  dataQuality: 'moderate',
                  warnings: ['Competition assessment could be more comprehensive'],
                },
                {
                  factor: 'monetization',
                  score: 71,
                  weight: 0.25,
                  contribution: 18,
                  explanation: 'Strong monetization potential. Clear audience with identified pain points indicates willingness to pay.',
                  dataQuality: 'strong',
                },
              ],
              dataQuality: {
                strongFactors: 3,
                insufficientFactors: 0,
                gaps: [],
              },
            },
            data_sources_available: {
              reddit: true,
              trends: true,
              tiktok: true,
            },
          },
          market_node: {
            name: 'AI-Powered Meal Planning for Busy Parents',
            description: 'Sub-niche focused on automated meal planning solutions for time-constrained parents',
          },
        };

        const mockSources: ValidationSource[] = [
          {
            id: '1',
            source_type: 'social',
            citation: 'Reddit search: "meal planning parents" (42 posts, 156 comments)',
            evidence: 'Analyzed discussions across 8 subreddits. Top subreddits: r/Parenting, r/MealPrepSunday, r/EatCheapAndHealthy.',
            metadata: {
              platform: 'reddit',
              query: 'meal planning parents',
              fetched_at: new Date().toISOString(),
              reproducible: true,
            },
          },
          {
            id: '2',
            source_type: 'search',
            citation: 'Google Trends: "meal planning app" (12-month analysis)',
            evidence: '12-month trend: rising (+24% growth). Average interest: 68.',
            metadata: {
              platform: 'google_trends',
              query: 'meal planning app',
              fetched_at: new Date().toISOString(),
              reproducible: true,
            },
          },
          {
            id: '3',
            source_type: 'social',
            citation: 'TikTok (via Apify): "meal prep for families" (28 videos)',
            evidence: 'Total engagement: 2.4M views, 156K likes, 3.2K comments. Top hashtags: #mealprep, #momlife, #easydinner.',
            metadata: {
              platform: 'tiktok',
              query: 'meal prep for families',
              fetched_at: new Date().toISOString(),
              reproducible: true,
            },
          },
        ];

        setValidation(mockValidation);
        setSources(mockSources);
      } catch (err: any) {
        setError(err.message || 'Failed to load validation data');
      } finally {
        setLoading(false);
      }
    };

    fetchValidation();
  }, [validationId]);

  if (loading) {
    return (
      <AppLayout title="Loading Validation...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-[#2563EB] animate-spin" />
            <p className="text-[14px] text-[#94A3B8]">Loading validation data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !validation) {
    return (
      <AppLayout title="Validation Error">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center py-12 px-8">
              <AlertCircle className="h-12 w-12 text-[#EF4444] mb-4" />
              <h3 className="text-[18px] font-semibold text-[#1E293B] mb-2">Unable to Load Validation</h3>
              <p className="text-[14px] text-[#64748B] text-center mb-6">
                {error || 'The validation data could not be found.'}
              </p>
              <Button variant="secondary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Get factor icons
  const factorIcons: Record<string, string> = {
    trend: '📈',
    pain: '💢',
    competition: '🏆',
    monetization: '💰',
  };

  // Filter sources by type for tabs
  const redditSources = sources.filter(s => s.metadata?.platform === 'reddit');
  const tiktokSources = sources.filter(s => s.metadata?.platform === 'tiktok');
  const trendsSources = sources.filter(s => s.metadata?.platform === 'google_trends');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'reddit', label: 'Reddit', icon: '🔴', count: redditSources.length },
    { id: 'tiktok', label: 'TikTok', icon: '🎵', count: tiktokSources.length },
    { id: 'trends', label: 'Trends', icon: '📈', count: trendsSources.length },
  ];

  return (
    <AppLayout title={validation.market_node?.name || 'Validation Results'}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-[32px] font-bold text-[#0F172A]">
              {validation.market_node?.name || 'Validation Results'}
            </h1>
          </div>
          {validation.market_node?.description && (
            <p className="text-[15px] text-[#64748B]">{validation.market_node.description}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Section: Score + Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Opportunity Score */}
              <Card className="lg:col-span-1">
                <CardContent className="flex items-center justify-center py-8">
                  <OpportunityScore score={validation.overall_score} size="large" />
                </CardContent>
              </Card>

              {/* Summary & Confidence */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Market Validation Summary</CardTitle>
                    {validation.analysis_data.confidence && (
                      <Badge
                        variant={
                          validation.analysis_data.confidence === 'high'
                            ? 'success'
                            : validation.analysis_data.confidence === 'medium'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {validation.analysis_data.confidence.toUpperCase()} CONFIDENCE
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[15px] text-[#64748B] leading-relaxed mb-4">
                    {validation.analysis_data.explanation?.summary || validation.overall_explanation}
                  </p>

                  {validation.analysis_data.explanation?.dataQuality && (
                    <div className="flex items-center gap-6 p-4 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <div className="text-[12px] text-[#94A3B8] font-medium">Data Quality</div>
                        <div className="text-[16px] font-semibold text-[#1E293B]">
                          {validation.analysis_data.explanation.dataQuality.strongFactors}/4 Strong Factors
                        </div>
                      </div>
                      {validation.analysis_data.explanation.dataQuality.insufficientFactors > 0 && (
                        <div>
                          <div className="text-[12px] text-[#F59E0B] font-medium">⚠️ Gaps</div>
                          <div className="text-[14px] text-[#F59E0B]">
                            {validation.analysis_data.explanation.dataQuality.insufficientFactors} factors need more data
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Score Breakdown */}
            <div>
              <h2 className="text-[20px] font-semibold text-[#1E293B] mb-4">Score Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validation.analysis_data.explanation?.factorExplanations.map((factor) => (
                  <ScoreFactor
                    key={factor.factor}
                    icon={factorIcons[factor.factor] || '📊'}
                    title={factor.factor.charAt(0).toUpperCase() + factor.factor.slice(1)}
                    score={factor.score}
                    explanation={factor.explanation}
                    dataQuality={factor.dataQuality}
                    warnings={factor.warnings}
                    weight={factor.weight}
                  />
                ))}
              </div>
            </div>

            {/* Weights Used */}
            {validation.analysis_data.weights_used && (
              <CollapsibleSection title="Scoring Weights" icon="⚖️" defaultOpen={false}>
                <div className="space-y-3">
                  <p className="text-[13px] text-[#64748B]">
                    The following weights were used to calculate the opportunity score:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(validation.analysis_data.weights_used).map(([key, value]) => (
                      <div key={key} className="p-4 bg-[#F8FAFC] rounded-lg">
                        <div className="text-[12px] text-[#94A3B8] font-medium capitalize">{key}</div>
                        <div className="text-[24px] font-bold text-[#2563EB]">{Math.round(value * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* Data Sources */}
            {sources.length > 0 && (
              <div>
                <h2 className="text-[20px] font-semibold text-[#1E293B] mb-4">Data Sources</h2>
                <div className="grid grid-cols-1 gap-4">
                  {sources.slice(0, 3).map((source) => (
                    <SourceCard
                      key={source.id}
                      platform={source.metadata?.platform || 'other'}
                      citation={source.citation}
                      evidence={source.evidence}
                      metadata={source.metadata}
                    />
                  ))}
                </div>
                {sources.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button variant="secondary" size="sm">
                      View All {sources.length} Sources
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reddit Tab */}
        {activeTab === 'reddit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-semibold text-[#1E293B]">Reddit Discussions</h2>
              <Badge variant="primary">{redditSources.length} sources</Badge>
            </div>
            {redditSources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-[14px] text-[#94A3B8]">No Reddit data available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {redditSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    platform={source.metadata?.platform || 'reddit'}
                    citation={source.citation}
                    evidence={source.evidence}
                    metadata={source.metadata}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TikTok Tab */}
        {activeTab === 'tiktok' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-semibold text-[#1E293B]">TikTok Content</h2>
              <Badge variant="primary">{tiktokSources.length} sources</Badge>
            </div>
            {tiktokSources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-[14px] text-[#94A3B8]">No TikTok data available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tiktokSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    platform={source.metadata?.platform || 'tiktok'}
                    citation={source.citation}
                    evidence={source.evidence}
                    metadata={source.metadata}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-semibold text-[#1E293B]">Search Trends</h2>
              <Badge variant="success">{trendsSources.length} sources</Badge>
            </div>
            {trendsSources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-[14px] text-[#94A3B8]">No Google Trends data available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trendsSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    platform={source.metadata?.platform || 'google_trends'}
                    citation={source.citation}
                    evidence={source.evidence}
                    metadata={source.metadata}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
