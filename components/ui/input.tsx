import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full px-4 py-3.5 text-[15px] border border-[#E5E7EB] rounded-[10px] bg-white text-[#0F172A] placeholder:text-[#94A3B8]',
          'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
          'transition-all duration-200',
          'disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#94A3B8]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
