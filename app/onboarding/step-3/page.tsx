'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { browserClient } from '@/lib/supabase/browser-client';
import { useJobPoller } from '@/components/job-poller';

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step3Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = searchParams.get('project_id');
  const validationId = searchParams.get('validation_id');
  const ideaId = searchParams.get('idea_id');
  const marketInput = searchParams.get('market_input');

  const [validationData, setValidationData] = useState<any>(null);
  const [ideaData, setIdeaData] = useState<any>(null);
  const [blueprintJobId, setBlueprintJobId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  // Poll blueprint job
  const {
    job: blueprintJob,
    error: blueprintError,
    isPolling: isBlueprintPolling,
  } = useJobPoller(blueprintJobId);

  // Fetch validation and idea data on mount
  useEffect(() => {
    async function fetchData() {
      if (!validationId || !ideaId) return;

      try {
        // Fetch validation data
        const { data: validation, error: validationError } = await browserClient
          .from('validations')
          .select('*')
          .eq('id', validationId)
          .single();

        if (validationError) {
          console.error('Failed to fetch validation:', validationError);
        } else {
          setValidationData(validation);
        }

        // Fetch idea data
        const { data: idea, error: ideaError } = await browserClient
          .from('ideas')
          .select('*')
          .eq('id', ideaId)
          .single();

        if (ideaError) {
          console.error('Failed to fetch idea:', ideaError);
        } else {
          setIdeaData(idea);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [validationId, ideaId]);

  // Handle blueprint job completion
  useEffect(() => {
    if (blueprintJob && blueprintJob.status === 'completed') {
      const blueprintId = blueprintJob.result_data?.blueprint_id;
      if (blueprintId) {
        // Navigate to step 4
        router.push(
          `/onboarding/step-4?project_id=${projectId}&blueprint_id=${blueprintId}&market_input=${encodeURIComponent(marketInput || '')}`
        );
      }
    }
  }, [blueprintJob, projectId, marketInput, router]);

  // Handle blueprint errors
  useEffect(() => {
    if (blueprintError) {
      alert(`Blueprint generation failed: ${blueprintError}`);
      setIsGeneratingBlueprint(false);
    }
  }, [blueprintError]);

  const handleContinue = async () => {
    if (!projectId || !ideaId) {
      alert('Missing project data.');
      return;
    }

    setIsGeneratingBlueprint(true);

    try {
      // Trigger blueprint creation job
      const response = await fetch('/api/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          idea_id: ideaId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start blueprint creation');
      }

      const data = await response.json();
      setBlueprintJobId(data.job_id);
    } catch (error) {
      console.error('Failed to create blueprint:', error);
      alert('Failed to create blueprint. Please try again.');
      setIsGeneratingBlueprint(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoadingData) {
    return (
      <div>
        <Stepper steps={steps} currentStep={3} completedSteps={[1, 2]} />
        <Card variant="default" padding="lg" className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#64748B]">Loading insights...</p>
          </div>
        </Card>
      </div>
    );
  }

  const analysisOutput = `# Market Validation Results - ${marketInput || 'Unknown Market'}

## Validation Score: ${validationData?.overall_score || 'N/A'}/100

${validationData?.overall_explanation || 'No explanation available'}

## Signal Breakdown

- **Search Score:** ${validationData?.search_score || 'N/A'}/100
- **Social Score:** ${validationData?.social_score || 'N/A'}/100
- **Competition Score:** ${validationData?.competition_score || 'N/A'}/100
- **Financial Score:** ${validationData?.financial_score || 'N/A'}/100

## Generated Product Idea

**Title:** ${ideaData?.title || 'Untitled'}

**Target Persona:**
${ideaData?.target_persona || 'Not specified'}

**Value Proposition:**
${ideaData?.value_proposition || 'Not specified'}

**Key Differentiators:**
${ideaData?.differentiators?.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') || 'None specified'}

---

[MOCKED DATA - This analysis is generated for demonstration purposes]`;

  const isProcessing = isGeneratingBlueprint && isBlueprintPolling;

  return (
    <div>
      <Stepper steps={steps} currentStep={3} completedSteps={[1, 2]} />

      {/* Main content card */}
      <Card variant="default" padding="lg" className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight mb-4">
            Your market insights ✨
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed max-w-3xl">
            We analyzed {marketInput || 'your market'} and found validated pain points with real demand.
            Here's your validation score and product idea.
          </p>
        </div>

        {/* Code-style output container */}
        <div className="mb-8">
          <div className="bg-[#0F172A] rounded-[14px] p-8 overflow-auto max-h-[500px] font-mono text-sm leading-relaxed shadow-sm">
            <pre className="text-[#E5E7EB] whitespace-pre-wrap">
              {analysisOutput}
            </pre>
          </div>
        </div>

        {/* Pro Tip callout */}
        <div className="mb-12 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-[12px] p-6">
          <div className="flex items-start gap-3">
            <div className="text-[20px]">💡</div>
            <div>
              <h4 className="font-semibold text-[#1E293B] mb-1.5 text-[14px]">
                Key insight
              </h4>
              <p className="text-[14px] text-[#64748B] leading-relaxed">
                The strongest opportunities solve problems people are{' '}
                <strong>actively complaining about</strong> and already trying to
                solve with imperfect alternatives. Your score of {validationData?.overall_score || 'N/A'}/100 indicates{' '}
                {(validationData?.overall_score || 0) >= 70 ? 'strong' : (validationData?.overall_score || 0) >= 50 ? 'moderate' : 'limited'} market validation.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="h-10 px-4 rounded-[8px]"
            disabled={isProcessing}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={isProcessing} loading={isProcessing}>
            {isProcessing ? 'Creating blueprint...' : 'Continue to blueprint'}
            {!isProcessing && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
