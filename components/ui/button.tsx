import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Primary gradient button (approved design)
        primary:
          'bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-blue-200/50 hover:scale-[1.02] disabled:from-[#F1F5F9] disabled:to-[#F1F5F9] disabled:text-[#94A3B8] disabled:shadow-none disabled:scale-100',

        // Secondary outline
        secondary:
          'border-2 border-[#E5E7EB] bg-white text-[#1E293B] hover:border-[#2563EB] hover:bg-[#F0F9FF] hover:shadow-sm disabled:bg-[#F9FAFB] disabled:text-[#94A3B8] disabled:border-[#E5E7EB]',

        // Ghost (minimal)
        ghost:
          'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 disabled:text-[#94A3B8]',

        // Link style
        link: 'text-[#2563EB] underline-offset-4 hover:underline disabled:text-[#94A3B8] disabled:no-underline',
      },
      size: {
        sm: 'h-10 px-4 text-[14px] rounded-[8px]',
        default: 'h-12 px-6 text-[15px] rounded-[10px]',
        lg: 'h-14 px-8 text-[16px] rounded-[12px]',
        icon: 'h-10 w-10 rounded-[8px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
