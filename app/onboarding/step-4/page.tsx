'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step4Page() {
  const [hookGenerated, setHookGenerated] = useState(false);

  const generateHook = () => {
    setHookGenerated(true);
  };

  return (
    <div>
      <Stepper steps={steps} currentStep={4} completedSteps={[1, 2, 3]} />

      {/* Main content card */}
      <Card variant="default" padding="lg" className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight mb-4">
            Launch strategy 🎯
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed max-w-3xl">
            Most products fail from poor distribution, not poor quality. Here's
            your custom launch plan based on where your target customers spend
            time.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Left column */}
          <div className="space-y-6">
            {/* Viral Hook Generator */}
            <Card variant="feature" padding="default">
              <div className="flex items-start gap-3 mb-5">
                <div className="text-[28px]">⚡</div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1E293B] mb-1">
                    Content hooks
                  </h3>
                  <p className="text-[14px] text-[#94A3B8]">
                    Attention-grabbing hooks for social platforms
                  </p>
                </div>
              </div>

              {hookGenerated ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[10px] p-4 mb-4 border border-slate-200">
                  <p className="text-[14px] text-[#1E293B] font-medium mb-2">
                    "I spent $2,847 on personal trainers before building an AI
                    that does it better for $9/month"
                  </p>
                  <p className="text-[12px] text-[#94A3B8]">
                    📊 Projected reach: 8,400+ impressions
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-[10px] p-6 mb-4 text-center border border-slate-200">
                  <p className="text-[14px] text-[#94A3B8]">
                    Generate hook variations for your market
                  </p>
                </div>
              )}

              <Button
                onClick={generateHook}
                disabled={hookGenerated}
                variant={hookGenerated ? 'secondary' : 'primary'}
                size="default"
                className="w-full"
              >
                {hookGenerated ? '✓ Generated' : '✨ Generate Hooks'}
              </Button>
            </Card>

            {/* Influencer Outreach */}
            <Card variant="feature" padding="default">
              <div className="flex items-start gap-3 mb-6">
                <div className="text-[28px]">👥</div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1E293B] mb-1">
                    Influencer targeting
                  </h3>
                  <p className="text-[14px] text-[#94A3B8]">
                    Micro-influencers in your niche
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[14px] text-[#64748B]">
                    Fitness YouTubers (10K-50K)
                  </span>
                  <span className="text-[14px] font-bold text-[#1E293B] bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    247
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[14px] text-[#64748B]">
                    Productivity TikTokers
                  </span>
                  <span className="text-[14px] font-bold text-[#1E293B] bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    189
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[14px] text-[#64748B]">
                    Health & Wellness Bloggers
                  </span>
                  <span className="text-[14px] font-bold text-[#1E293B] bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    156
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column - Dark pre-sale card */}
          <Card
            variant="default"
            padding="none"
            className="bg-gradient-to-br from-[#0B1220] to-[#1E293B] p-8 text-white flex flex-col shadow-lg"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="text-[28px]">🚀</div>
              <div>
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Pre-sale validation
                </h3>
                <p className="text-[14px] text-slate-300">
                  Validate demand before building anything
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] leading-relaxed text-slate-200">
                  Launch landing page with waitlist and early-bird pricing
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] leading-relaxed text-slate-200">
                  Offer 50% lifetime discount for first 100 customers
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] leading-relaxed text-slate-200">
                  Target: $5,000 in pre-sales before writing code
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] leading-relaxed text-slate-200">
                  Use Stripe payment links and Notion for tracking
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="default"
              className="w-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB]"
            >
              🎉 Start Pre-Sale Campaign
            </Button>
          </Card>
        </div>

        {/* Bottom Next Steps card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[14px] p-6">
          <div className="flex items-start gap-3">
            <div className="text-[24px]">📅</div>
            <div>
              <h4 className="font-semibold text-[#1E293B] mb-3 text-[15px]">
                Suggested 4-week timeline
              </h4>
              <div className="space-y-2.5 text-[14px] text-[#64748B]">
                <p>
                  <strong className="text-[#1E293B]">Week 1:</strong> Build
                  landing page, share hooks on Reddit and Twitter
                </p>
                <p>
                  <strong className="text-[#1E293B]">Week 2:</strong> Contact 50
                  micro-influencers, offer free lifetime access
                </p>
                <p>
                  <strong className="text-[#1E293B]">Week 3:</strong> Reach $5K
                  pre-sale goal, begin MVP development
                </p>
                <p>
                  <strong className="text-[#1E293B]">Week 4:</strong> Deliver
                  beta to early customers, collect testimonials
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
