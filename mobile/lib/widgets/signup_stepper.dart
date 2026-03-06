import 'package:flutter/material.dart';

class SignupStepper extends StatelessWidget {
  final int currentStep;
  final List<String> labels;

  const SignupStepper({
    super.key,
    required this.currentStep,
    required this.labels,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: List.generate(labels.length * 2 - 1, (i) {
          if (i.isOdd) {
            final stepBefore = i ~/ 2;
            final done = stepBefore < currentStep;
            return Expanded(
              child: Container(
                height: 2,
                color: done ? cs.primary : cs.outlineVariant,
              ),
            );
          }
          final step = i ~/ 2;
          final isActive = step == currentStep;
          final isDone = step < currentStep;
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor:
                    isDone || isActive ? cs.primary : cs.surfaceContainerHighest,
                child: isDone
                    ? Icon(Icons.check, size: 16, color: cs.onPrimary)
                    : Text(
                        '${step + 1}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isActive ? cs.onPrimary : cs.onSurfaceVariant,
                        ),
                      ),
              ),
              const SizedBox(height: 4),
              Text(
                labels[step],
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                  color: isActive ? cs.primary : cs.onSurfaceVariant,
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}
