'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step2Page() {
  const [isMining, setIsMining] = useState(false);
  const router = useRouter();

  const handleLaunch = () => {
    setIsMining(true);
    // Simulate mining process
    setTimeout(() => {
      router.push('/onboarding/step-3');
    }, 2000);
  };

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
            discover what people are actively struggling with in your market.
          </p>
        </div>

        {/* Dashed container */}
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-[14px] p-20 mb-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6">
              {isMining ? (
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-[36px]">🎯</div>
              )}
            </div>
            {isMining ? (
              <>
                <h3 className="text-[20px] font-semibold text-[#1E293B] mb-2">
                  Scanning conversations...
                </h3>
                <p className="text-[14px] text-[#94A3B8]">
                  Finding recurring problems and unmet needs
                </p>
              </>
            ) : (
              <>
                <h3 className="text-[20px] font-semibold text-[#1E293B] mb-2">
                  Ready to discover opportunities
                </h3>
                <p className="text-[14px] text-[#94A3B8] max-w-md">
                  Click below to start analyzing real conversations and identify
                  validated demand in your chosen market.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Launch button */}
        <div className="flex justify-center">
          <Button
            onClick={handleLaunch}
            disabled={isMining}
            loading={isMining}
            size="default"
          >
            {!isMining && <span className="text-[18px]">🚀</span>}
            {isMining ? 'Scanning...' : 'Start Scanning'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
