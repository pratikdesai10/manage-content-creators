# Module: Widgets

## Purpose
- Reusable UI components for forms and navigation

## Responsibilities
- Multi-select chip component for enum selections
- Step indicator for signup flows
- Navigation buttons for multi-step forms

## Folder Structure
```
widgets/
├── chip_multi_select.dart        — Generic ChipMultiSelect<T> with max selections
├── signup_stepper.dart           — Numbered step indicator with labels
├── step_navigation_buttons.dart  — Back/Next/Submit button row
├── common/                       — Reserved (empty)
└── forms/                        — Reserved (empty)
```

## Key Components
- **ChipMultiSelect\<T\>** — generic multi-select using FilterChips
  - Props: `items`, `selected`, `labelBuilder`, `onChanged`, `maxSelections?`
  - Prevents exceeding max selections
- **SignupStepper** — visual step indicator (1-5)
  - Props: `currentStep`, `labels`
  - Completed steps show checkmarks, active step highlighted
- **StepNavigationButtons** — Back + Next/Submit buttons
  - Props: `currentStep`, `totalSteps`, `onNext`, `onBack`, `isSubmitting`, `submitLabel`
  - Shows loading spinner during submission

## Dependencies
- External: `flutter/material.dart`

## Integration
- Used by `CreatorSignupScreen` and `AgencySignupScreen`

## Conventions
- Generic widgets go in root `widgets/`
- Common reusable widgets (not form-specific) go in `widgets/common/`
- Form-specific reusable widgets go in `widgets/forms/`
