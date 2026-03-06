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

  return (
    <div className="border-t border-gray-200 pt-6 mt-8 flex items-center justify-between">
      {/* Back button or spacer */}
      {isFirstStep ? (
        <div />
      ) : (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium transition-colors duration-200',
            'border-2 border-purple-600 text-purple-600',
            'hover:bg-purple-50',
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
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200',
            'bg-purple-600 hover:bg-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center gap-2',
          )}
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
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200',
            'bg-purple-600 hover:bg-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          Next
        </button>
      )}
    </div>
  );
}
