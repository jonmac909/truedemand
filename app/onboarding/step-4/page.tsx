'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { browserClient } from '@/lib/supabase/browser-client';

const steps = [
  { number: 1, label: 'CHOOSE MARKET', emoji: '🎯' },
  { number: 2, label: 'FIND PAIN POINTS', emoji: '🔍' },
  { number: 3, label: 'REVIEW INSIGHTS', emoji: '✨' },
  { number: 4, label: 'LAUNCH PLAN', emoji: '🚀' },
];

export default function Step4Page() {
  const searchParams = useSearchParams();

  const blueprintId = searchParams.get('blueprint_id');
  const marketInput = searchParams.get('market_input');

  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch blueprint data on mount
  useEffect(() => {
    async function fetchData() {
      if (!blueprintId) return;

      try {
        const { data: blueprint, error } = await browserClient
          .from('blueprints')
          .select(`
            *,
            ideas!inner(
              title,
              target_persona,
              value_proposition
            )
          `)
          .eq('id', blueprintId)
          .single();

        if (error) {
          console.error('Failed to fetch blueprint:', error);
        } else {
          setBlueprintData(blueprint);
        }
      } catch (error) {
        console.error('Error fetching blueprint:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [blueprintId]);

  const handleExport = async () => {
    if (!blueprintId) return;

    setIsExporting(true);

    try {
      const response = await fetch(`/api/blueprints/${blueprintId}/export`);

      if (!response.ok) {
        throw new Error('Failed to export blueprint');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint-${blueprintId}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export blueprint:', error);
      alert('Failed to export blueprint. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div>
        <Stepper steps={steps} currentStep={4} completedSteps={[1, 2, 3]} />
        <Card variant="default" padding="lg" className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#64748B]">Loading blueprint...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Stepper steps={steps} currentStep={4} completedSteps={[1, 2, 3]} />

      {/* Main content card */}
      <Card variant="default" padding="lg" className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight mb-4">
            Your Product Blueprint 🚀
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed max-w-3xl">
            Your complete implementation plan for <strong>{marketInput || 'your product'}</strong> is ready.
            Download it below to get started building your validated product idea.
          </p>
        </div>

        {/* Blueprint summary cards */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Left column */}
          <div className="space-y-6">
            {/* Product Overview */}
            <Card variant="feature" padding="default">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-[28px]">💡</div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1E293B] mb-1">
                    Product Overview
                  </h3>
                  <p className="text-[14px] text-[#94A3B8]">
                    {blueprintData?.ideas?.title || 'Your Product Idea'}
                  </p>
                </div>
              </div>
              <p className="text-[14px] text-[#64748B] leading-relaxed">
                {blueprintData?.ideas?.value_proposition?.substring(0, 150) || 'Your product value proposition'}...
              </p>
            </Card>

            {/* Target Market */}
            <Card variant="feature" padding="default">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-[28px]">👥</div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1E293B] mb-1">
                    Target Market
                  </h3>
                  <p className="text-[14px] text-[#94A3B8]">
                    Who you're building for
                  </p>
                </div>
              </div>
              <p className="text-[14px] text-[#64748B] leading-relaxed">
                {blueprintData?.ideas?.target_persona?.substring(0, 120) || 'Your target customer persona'}...
              </p>
            </Card>
          </div>

          {/* Right column - Blueprint ready card */}
          <Card
            variant="default"
            padding="none"
            className="bg-gradient-to-br from-[#0B1220] to-[#1E293B] p-8 text-white flex flex-col shadow-lg"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="text-[28px]">📋</div>
              <div>
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Complete Blueprint Ready
                </h3>
                <p className="text-[14px] text-slate-300">
                  Everything you need to launch your product
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-grow text-[14px] text-slate-200">
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Executive summary and market opportunity</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Target market analysis and customer profiles</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Feature roadmap (MVP, Phase 2, Phase 3)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Positioning strategy and messaging</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Go-to-market recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Risk assessment and mitigation strategies</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="default"
              onClick={handleExport}
              disabled={isExporting}
              loading={isExporting}
              className="w-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB]"
            >
              {!isExporting && <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Download Blueprint (.md)'}
            </Button>
          </Card>
        </div>

        {/* Next Steps callout */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[14px] p-6">
          <div className="flex items-start gap-3">
            <div className="text-[24px]">🎯</div>
            <div>
              <h4 className="font-semibold text-[#1E293B] mb-3 text-[15px]">
                What's Next?
              </h4>
              <div className="space-y-2.5 text-[14px] text-[#64748B]">
                <p>
                  <strong className="text-[#1E293B]">1. Review Your Blueprint:</strong> Read through the full markdown file to understand your product strategy
                </p>
                <p>
                  <strong className="text-[#1E293B]">2. Validate Assumptions:</strong> Talk to 5-10 potential customers to confirm the pain points identified
                </p>
                <p>
                  <strong className="text-[#1E293B]">3. Build MVP:</strong> Focus on the core features outlined in the MVP section (4-6 weeks)
                </p>
                <p>
                  <strong className="text-[#1E293B]">4. Launch & Iterate:</strong> Follow the go-to-market recommendations and collect feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
