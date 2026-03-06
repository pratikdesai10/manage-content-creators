import 'package:flutter/material.dart';

class ChipMultiSelect<T> extends StatelessWidget {
  final List<T> items;
  final Set<T> selected;
  final String Function(T) labelBuilder;
  final ValueChanged<Set<T>> onChanged;
  final int? maxSelections;

  const ChipMultiSelect({
    super.key,
    required this.items,
    required this.selected,
    required this.labelBuilder,
    required this.onChanged,
    this.maxSelections,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        final isSelected = selected.contains(item);
        return FilterChip(
          label: Text(labelBuilder(item)),
          selected: isSelected,
          onSelected: (value) {
            final next = Set<T>.from(selected);
            if (value) {
              if (maxSelections != null && next.length >= maxSelections!) return;
              next.add(item);
            } else {
              next.remove(item);
            }
            onChanged(next);
          },
          selectedColor: cs.primaryContainer,
          checkmarkColor: cs.onPrimaryContainer,
          labelStyle: TextStyle(
            color: isSelected ? cs.onPrimaryContainer : cs.onSurfaceVariant,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
          side: BorderSide(
            color: isSelected ? cs.primary : cs.outlineVariant,
          ),
        );
      }).toList(),
    );
  }
}
