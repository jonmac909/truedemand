'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Market {
  id: string;
  title: string;
  emoji: string;
  examples: string[];
}

const markets: Market[] = [
  {
    id: 'health',
    title: 'Health',
    emoji: '💪',
    examples: [
      'Weight loss and fitness',
      'Mental health and therapy',
      'Sleep optimization',
      'Nutrition and diet plans',
    ],
  },
  {
    id: 'wealth',
    title: 'Wealth',
    emoji: '💰',
    examples: [
      'Investment and trading',
      'Side hustles and passive income',
      'Career advancement',
      'Financial planning and budgeting',
    ],
  },
  {
    id: 'relationships',
    title: 'Relationships',
    emoji: '❤️',
    examples: [
      'Dating and romance',
      'Marriage and partnerships',
      'Parenting and family',
      'Social skills and networking',
    ],
  },
];

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step1Page() {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [customMarket, setCustomMarket] = useState('');
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedMarket && !customMarket.trim()) return;

    const marketInput = customMarket.trim() || selectedMarket;
    if (!marketInput) return;

    try {
      // Create project and market node
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_input: marketInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();

      // Store project data in URL params for next step
      router.push(
        `/onboarding/step-2?project_id=${data.project_id}&market_node_id=${data.market_node_id}&market_input=${encodeURIComponent(data.market_input)}`
      );
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const isValid = selectedMarket !== null || customMarket.trim().length > 0;

  return (
    <div>
      <Stepper steps={steps} currentStep={1} completedSteps={[]} />

      {/* Main content card */}
      <Card variant="default" padding="lg" className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight mb-4">
            Choose your market
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed max-w-3xl">
            Start with one of the three proven markets where people consistently
            spend money, or define your own focus area below.
          </p>
        </div>

        {/* Market cards */}
        <div className="grid grid-cols-3 gap-5 mb-12">
          {markets.map((market) => {
            const isSelected = selectedMarket === market.id;

            return (
              <Card
                key={market.id}
                variant={isSelected ? 'selected' : 'selectable'}
                padding="default"
                asButton
                onClick={() => {
                  setSelectedMarket(market.id);
                  setCustomMarket('');
                }}
              >
                <div className="text-left">
                  <div className="text-[32px] mb-4">{market.emoji}</div>
                  <h3 className="text-[18px] font-semibold text-[#1E293B] mb-4">
                    {market.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {market.examples.map((example, idx) => (
                      <li
                        key={idx}
                        className="text-[14px] text-[#64748B] flex items-start leading-relaxed"
                      >
                        <span className="text-[#94A3B8] mr-2.5">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Custom input */}
        <div className="mb-10">
          <label className="block text-[14px] font-medium text-[#1E293B] mb-3">
            Or define your own market
          </label>
          <Input
            type="text"
            value={customMarket}
            onChange={(e) => {
              setCustomMarket(e.target.value);
              if (e.target.value.trim()) {
                setSelectedMarket(null);
              }
            }}
            placeholder="e.g., Pet care for senior dogs, Sustainable fashion for millennials..."
          />
        </div>

        {/* Continue button */}
        <div className="flex justify-end">
          <Button onClick={handleContinue} disabled={!isValid}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
