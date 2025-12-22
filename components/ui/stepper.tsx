import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  number: number;
  label: string;
  emoji: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  className,
}: StepperProps) {
  return (
    <div className={cn('mb-20', className)}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = completedSteps.includes(step.number);
          const showLine = index < steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Circle with icon */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
                    isActive &&
                      'bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-lg shadow-blue-200/50 scale-110',
                    isCompleted &&
                      !isActive &&
                      'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300',
                    !isActive &&
                      !isCompleted &&
                      'bg-white border-2 border-[#E5E7EB]'
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <span className="text-[22px]">{step.emoji}</span>
                  )}
                </div>

                {/* Label */}
                <div
                  className={cn(
                    'mt-3.5 text-[12px] font-semibold tracking-[0.06em] transition-colors',
                    isActive && 'text-[#2563EB]',
                    !isActive && isCompleted && 'text-emerald-600',
                    !isActive && !isCompleted && 'text-[#94A3B8]'
                  )}
                >
                  {step.label}
                </div>
              </div>

              {/* Connecting line */}
              {showLine && (
                <div className="flex-1 h-[3px] mx-5 -mt-10">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      isCompleted || (isActive && index < currentStep - 1)
                        ? 'bg-gradient-to-r from-emerald-300 to-green-300'
                        : 'bg-[#E5E7EB]'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
