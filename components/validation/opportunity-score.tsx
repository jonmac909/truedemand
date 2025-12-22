'use client';

import { cn } from '@/lib/utils';

interface OpportunityScoreProps {
  score: number;
  size?: 'default' | 'large';
  className?: string;
}

export function OpportunityScore({ score, size = 'default', className }: OpportunityScoreProps) {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return { stroke: '#10B981', bg: '#ECFDF5', text: '#10B981' }; // Success green
    if (score >= 40) return { stroke: '#F59E0B', bg: '#FEF3C7', text: '#F59E0B' }; // Warning amber
    return { stroke: '#EF4444', bg: '#FEE2E2', text: '#EF4444' }; // Error red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Opportunity';
    if (score >= 40) return 'Medium Opportunity';
    return 'Low Opportunity';
  };

  const colors = getScoreColor(score);
  const label = getScoreLabel(score);

  const dimensions = size === 'large' ? {
    size: 200,
    strokeWidth: 12,
    radius: 88,
    fontSize: '48px',
    labelSize: '14px'
  } : {
    size: 160,
    strokeWidth: 10,
    radius: 70,
    fontSize: '40px',
    labelSize: '12px'
  };

  const circumference = 2 * Math.PI * dimensions.radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={dimensions.size}
          height={dimensions.size}
          viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
        >
          {/* Background track */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={dimensions.radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={dimensions.strokeWidth}
          />
          {/* Progress arc with animation */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={dimensions.radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-bold"
            style={{
              fontSize: dimensions.fontSize,
              color: colors.text,
              lineHeight: 1
            }}
          >
            {score}
          </div>
          <div
            className="font-medium text-[#94A3B8] mt-1"
            style={{ fontSize: dimensions.labelSize }}
          >
            / 100
          </div>
        </div>
      </div>

      {/* Label below */}
      <div className="text-center">
        <div
          className="font-semibold"
          style={{
            color: colors.text,
            fontSize: '15px'
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
