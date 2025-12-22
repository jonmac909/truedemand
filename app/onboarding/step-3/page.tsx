'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ChevronLeft, ArrowRight } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const analysisOutput = `# Market Analysis Results

## Top Pain Points Discovered (Ranked by Urgency)

1. **Lack of personalized fitness tracking for busy professionals**
   - Mentioned 247 times across 18 subreddits
   - Common complaint: "Generic workout apps don't account for my schedule"
   - Willingness to pay: High (avg. mentioned budget: $50-100/month)

2. **Difficulty staying motivated during home workouts**
   - Mentioned 189 times
   - Quote: "I need accountability but can't afford a personal trainer"
   - Looking for: Virtual coaching, community support

3. **Nutrition tracking is too time-consuming**
   - Mentioned 156 times
   - Pain: "Logging every meal takes 20 minutes a day"
   - Desired solution: AI-powered meal logging via photos

## Validated Opportunity Gaps

✓ No existing product combines AI coaching + schedule optimization
✓ Market size: 2.3M potential customers (fitness + productivity communities)
✓ Competition: Low (most apps are generic fitness trackers)
✓ Customer acquisition cost: Estimated $15-25 (organic social media reach)

## Recommended Product Direction

Build: AI-powered fitness coach that adapts to calendar availability
Target: Professionals aged 28-45 with disposable income
Launch strategy: Reddit + ProductHunt + fitness influencer partnerships`;

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step3Page() {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push('/onboarding/step-4');
  };

  const handleBack = () => {
    router.push('/onboarding/step-2');
  };

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
            We analyzed thousands of conversations and found validated pain points
            with real demand. Here's what people are actively looking for.
          </p>
        </div>

        {/* Code-style output container */}
        <div className="mb-8 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              className="h-10 px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

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
                solve with imperfect alternatives. Look for high frequency + clear
                willingness to pay.
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
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleContinue}>
            Continue to launch plan
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
