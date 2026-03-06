import { cn } from '../../../lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick: (step: number) => void;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
}: ProgressBarProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted) onStepClick(step);
                  }}
                  disabled={isUpcoming || isCurrent}
                  className={cn(
                    'flex items-center justify-center rounded-full font-semibold text-sm transition-all duration-300',
                    isCompleted &&
                      'w-10 h-10 bg-purple-600 text-white cursor-pointer hover:bg-purple-700',
                    isCurrent &&
                      'w-12 h-12 bg-blue-500 text-white ring-4 ring-blue-200 scale-110',
                    isUpcoming &&
                      'w-10 h-10 bg-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                  aria-label={`Step ${step}: ${stepLabels[i]}`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center whitespace-nowrap',
                    isCompleted && 'text-purple-600',
                    isCurrent && 'text-blue-600',
                    isUpcoming && 'text-gray-400',
                  )}
                >
                  {stepLabels[i]}
                </span>
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors duration-300',
                    isCompleted ? 'bg-purple-600' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
