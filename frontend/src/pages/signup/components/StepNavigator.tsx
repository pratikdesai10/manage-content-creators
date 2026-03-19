import { cn } from '../../../lib/utils';

interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function StepNavigator({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  submitLabel = 'Submit',
}: StepNavigatorProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const gradientBtnClass = cn(
    'px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200',
    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    'shadow-lg shadow-indigo-500/25',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  );

  return (
    <div className="border-t border-white/10 pt-6 mt-8 flex items-center justify-between">
      {/* Back button or spacer */}
      {isFirstStep ? (
        <div />
      ) : (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={cn(
            'px-6 py-2.5 rounded-xl font-medium transition-all duration-200',
            'border border-white/20 text-white',
            'hover:bg-white/10',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          Back
        </button>
      )}

      {/* Next / Submit button */}
      {isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className={cn(gradientBtnClass, 'flex items-center gap-2')}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              {submitLabel}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className={gradientBtnClass}
        >
          Next
        </button>
      )}
    </div>
  );
}
