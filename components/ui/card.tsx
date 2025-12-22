import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'bg-white text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        // Default card
        default: 'border border-[#E5E7EB] shadow-sm rounded-[14px]',

        // Selectable card (for market selection, etc.)
        selectable:
          'border border-[#E5E7EB] rounded-[14px] cursor-pointer hover:-translate-y-0.5 hover:border-[rgba(37,99,235,0.4)] hover:bg-[#F0F9FF] hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]',

        // Selected state
        selected:
          'border-[2px] border-[#2563EB] bg-[#EFF6FF] shadow-sm rounded-[14px]',

        // Feature card with hover
        feature:
          'border border-[#E5E7EB] rounded-[14px] shadow-sm hover:shadow-md transition-shadow',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asButton?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asButton = false, ...props }, ref) => {
    const Comp = asButton ? 'button' : 'div';
    return (
      <Comp
        ref={ref as any}
        className={cn(cardVariants({ variant, padding, className }))}
        {...(props as any)}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-[18px] font-semibold text-[#1E293B]', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-[14px] text-[#94A3B8] leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
