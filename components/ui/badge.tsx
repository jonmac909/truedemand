import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-1 text-[12px] font-semibold rounded-md transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
        secondary: 'bg-[#F1F5F9] text-[#64748B] border border-[#E5E7EB]',
        success: 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]',
        warning: 'bg-[#FEF3C7] text-[#F59E0B] border border-[#FCD34D]',
        error: 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]',
        outline: 'border border-[#E5E7EB] text-[#64748B] bg-white',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
