'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreFactorProps {
  icon: string;
  title: string;
  score: number | null;
  explanation: string;
  dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient';
  warnings?: string[];
  weight: number;
}

export function ScoreFactor({
  icon,
  title,
  score,
  explanation,
  dataQuality,
  warnings,
  weight,
}: ScoreFactorProps) {
  // Color based on data quality
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'strong':
        return 'text-[#10B981]';
      case 'moderate':
        return 'text-[#F59E0B]';
      case 'weak':
      case 'insufficient':
        return 'text-[#94A3B8]';
      default:
        return 'text-[#64748B]';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'strong':
        return <Badge variant="success">Strong Data</Badge>;
      case 'moderate':
        return <Badge variant="warning">Moderate Data</Badge>;
      case 'weak':
        return <Badge variant="secondary">Weak Data</Badge>;
      case 'insufficient':
        return <Badge variant="error">Insufficient Data</Badge>;
      default:
        return null;
    }
  };

  const getScoreBar = (score: number | null) => {
    if (score === null) return null;

    const width = `${score}%`;
    let barColor = '#10B981'; // Green
    if (score < 40) barColor = '#EF4444'; // Red
    else if (score < 70) barColor = '#F59E0B'; // Amber

    return (
      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width,
            backgroundColor: barColor,
          }}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <div className="text-[15px] font-semibold text-[#1E293B]">{title}</div>
              <div className="text-[12px] text-[#94A3B8] mt-0.5">
                Weight: {Math.round(weight * 100)}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {score !== null ? (
              <div className={cn('text-[28px] font-bold', getQualityColor(dataQuality))}>
                {score}
              </div>
            ) : (
              <div className="text-[28px] font-bold text-[#94A3B8]">—</div>
            )}
          </div>
        </div>

        {getScoreBar(score)}

        <div className="mt-4">
          <p className="text-[14px] text-[#64748B] leading-relaxed">{explanation}</p>
        </div>

        {warnings && warnings.length > 0 && (
          <div className="mt-3 p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg">
            <div className="text-[12px] text-[#F59E0B] font-medium mb-1">⚠️ Data Quality Notes:</div>
            <ul className="text-[12px] text-[#F59E0B] space-y-1">
              {warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          {getQualityBadge(dataQuality)}
        </div>
      </CardContent>
    </Card>
  );
}
