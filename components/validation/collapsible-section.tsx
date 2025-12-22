'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon && <span className="text-xl">{icon}</span>}
            <span className="text-[16px] font-semibold text-[#1E293B]">{title}</span>
          </div>
          <div className="text-[#64748B]">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {isOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-[#F1F5F9]">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
