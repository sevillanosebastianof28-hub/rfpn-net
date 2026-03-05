import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { STEP_LABELS } from '@/types/application-form';

interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: Props) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-max gap-0">
        {STEP_LABELS.map((label, idx) => {
          const step = idx + 1;
          const isActive = step === currentStep;
          const isComplete = step < currentStep;

          return (
            <div key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => onStepClick(step)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all',
                  'hover:bg-muted/50 cursor-pointer',
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2',
                  isActive && 'bg-primary text-primary-foreground border-primary scale-110',
                  isComplete && 'bg-primary/20 text-primary border-primary/40',
                  !isActive && !isComplete && 'bg-muted text-muted-foreground border-muted-foreground/20',
                )}>
                  {isComplete ? <Check className="h-4 w-4" /> : step}
                </div>
                <span className={cn(
                  'text-[10px] max-w-[70px] text-center leading-tight',
                  isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
                )}>
                  {label}
                </span>
              </button>
              {step < 12 && (
                <div className={cn(
                  'w-4 h-0.5 mt-[-12px]',
                  isComplete ? 'bg-primary/40' : 'bg-muted-foreground/20',
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
