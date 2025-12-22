'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  platform: 'reddit' | 'tiktok' | 'google_trends' | 'llm_claude' | string;
  citation: string;
  evidence: string;
  metadata?: any;
  className?: string;
}

export function SourceCard({ platform, citation, evidence, metadata, className }: SourceCardProps) {
  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return { variant: 'primary' as const, icon: '🔴', label: 'Reddit' };
      case 'tiktok':
        return { variant: 'primary' as const, icon: '🎵', label: 'TikTok' };
      case 'google_trends':
        return { variant: 'success' as const, icon: '📈', label: 'Google Trends' };
      case 'llm_claude':
        return { variant: 'secondary' as const, icon: '🤖', label: 'AI Analysis' };
      default:
        return { variant: 'outline' as const, icon: '📊', label: platform };
    }
  };

  const platformInfo = getPlatformBadge(platform);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={platformInfo.variant}>
            <span className="mr-1">{platformInfo.icon}</span>
            {platformInfo.label}
          </Badge>
          {metadata?.fetched_at && (
            <div className="text-[11px] text-[#94A3B8]">
              {formatDate(metadata.fetched_at)}
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="text-[14px] font-semibold text-[#1E293B] mb-2">
            {citation}
          </div>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            {evidence}
          </p>
        </div>

        {metadata?.query && (
          <div className="mt-3 p-3 bg-[#F8FAFC] rounded-lg">
            <div className="text-[11px] text-[#94A3B8] font-medium mb-1">Search Query:</div>
            <div className="text-[12px] text-[#64748B] font-mono">"{metadata.query}"</div>
          </div>
        )}

        {metadata?.reproducible && (
          <div className="mt-3 flex items-center gap-2">
            <div className="text-[11px] text-[#10B981]">✓ Reproducible</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
