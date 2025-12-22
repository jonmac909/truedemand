'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-[#E5E7EB]', className)}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-5 py-3 text-[14px] font-medium transition-all duration-200 relative',
              'hover:text-[#2563EB]',
              activeTab === tab.id
                ? 'text-[#2563EB]'
                : 'text-[#64748B]'
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                  activeTab === tab.id
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'bg-[#F1F5F9] text-[#94A3B8]'
                )}>
                  {tab.count}
                </span>
              )}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
