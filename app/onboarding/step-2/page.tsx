'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobPoller } from '@/components/job-poller';

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step2Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = searchParams.get('project_id');
  const marketNodeId = searchParams.get('market_node_id');
  const marketInput = searchParams.get('market_input');

  const [validationJobId, setValidationJobId] = useState<string | null>(null);
  const [ideaJobId, setIdeaJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to discover opportunities');
  const [isProcessing, setIsProcessing] = useState(false);

  // Poll validation job
  const {
    job: validationJob,
    error: validationError,
    isPolling: isValidationPolling,
  } = useJobPoller(validationJobId);

  // Poll idea generation job
  const {
    job: ideaJob,
    error: ideaError,
    isPolling: isIdeaPolling,
  } = useJobPoller(ideaJobId);

  // Handle validation job completion
  useEffect(() => {
    if (validationJob && validationJob.status === 'completed') {
      const validationId = validationJob.result_data?.validation_id;
      if (validationId) {
        // Trigger idea generation job
        triggerIdeaGeneration(validationId);
      }
    } else if (validationJob && validationJob.status === 'running') {
      setStatusMessage('Scanning conversations and analyzing market signals...');
    }
  }, [validationJob]);

  // Handle idea job completion
  useEffect(() => {
    if (ideaJob && ideaJob.status === 'completed') {
      const ideaId = ideaJob.result_data?.idea_id;
      const validationId = validationJob?.result_data?.validation_id;
      if (ideaId && validationId) {
        // Navigate to step 3
        router.push(
          `/onboarding/step-3?project_id=${projectId}&validation_id=${validationId}&idea_id=${ideaId}&market_input=${encodeURIComponent(marketInput || '')}`
        );
      }
    } else if (ideaJob && ideaJob.status === 'running') {
      setStatusMessage('Generating product ideas from validated gaps...');
    }
  }, [ideaJob, validationJob, projectId, marketInput, router]);

  // Handle errors
  useEffect(() => {
    if (validationError) {
      alert(`Validation failed: ${validationError}`);
      setIsProcessing(false);
    }
    if (ideaError) {
      alert(`Idea generation failed: ${ideaError}`);
      setIsProcessing(false);
    }
  }, [validationError, ideaError]);

  const handleLaunch = async () => {
    if (!projectId || !marketNodeId) {
      alert('Missing project data. Please go back to step 1.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Starting validation analysis...');

    try {
      // Trigger validation job
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          market_node_id: marketNodeId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start validation');
      }

      const data = await response.json();
      setValidationJobId(data.job_id);
    } catch (error) {
      console.error('Failed to start validation:', error);
      alert('Failed to start validation. Please try again.');
      setIsProcessing(false);
    }
  };

  const triggerIdeaGeneration = async (validationId: string) => {
    setStatusMessage('Validation complete! Generating product ideas...');

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          validation_id: validationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start idea generation');
      }

      const data = await response.json();
      setIdeaJobId(data.job_id);
    } catch (error) {
      console.error('Failed to start idea generation:', error);
      alert('Failed to generate ideas. Please try again.');
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing && (isValidationPolling || isIdeaPolling);

  return (
    <div>
      <Stepper steps={steps} currentStep={2} completedSteps={[1]} />

      {/* Main content card */}
      <Card variant="default" padding="lg" className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight mb-4">
            Find real pain points 🔍
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed max-w-2xl">
            We'll scan thousands of Reddit discussions and forum conversations to
            discover what people are actively struggling with in {marketInput || 'your market'}.
          </p>
        </div>

        {/* Dashed container */}
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-[14px] p-20 mb-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6">
              {isLoading ? (
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-[36px]">🎯</div>
              )}
            </div>
            <h3 className="text-[20px] font-semibold text-[#1E293B] mb-2">
              {isLoading ? 'Analyzing market...' : 'Ready to discover opportunities'}
            </h3>
            <p className="text-[14px] text-[#94A3B8] max-w-md">
              {isLoading
                ? statusMessage
                : 'Click below to start analyzing real conversations and identify validated demand in your chosen market.'}
            </p>
          </div>
        </div>

        {/* Launch button */}
        <div className="flex justify-center">
          <Button
            onClick={handleLaunch}
            disabled={isLoading}
            loading={isLoading}
            size="default"
          >
            {!isLoading && <span className="text-[18px]">🚀</span>}
            {isLoading ? 'Analyzing...' : 'Start Scanning'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
