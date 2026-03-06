import 'package:flutter/material.dart';

class StepNavigationButtons extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final VoidCallback onNext;
  final VoidCallback onBack;
  final bool isSubmitting;
  final String submitLabel;

  const StepNavigationButtons({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.onNext,
    required this.onBack,
    this.isSubmitting = false,
    this.submitLabel = 'Submit',
  });

  bool get _isLastStep => currentStep == totalSteps - 1;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Row(
        children: [
          if (currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: isSubmitting ? null : onBack,
                child: const Text('Back'),
              ),
            ),
          if (currentStep > 0) const SizedBox(width: 16),
          Expanded(
            flex: currentStep == 0 ? 1 : 1,
            child: FilledButton(
              onPressed: isSubmitting ? null : onNext,
              child: isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(_isLastStep ? submitLabel : 'Next'),
            ),
          ),
        ],
      ),
    );
  }
}
