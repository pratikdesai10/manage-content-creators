# Module: Lib

## Purpose
- Shared utility functions

## Responsibilities
- Provide `cn()` for conditional Tailwind CSS class merging

## Folder Structure
```
lib/
└── utils.ts — Utility functions
```

## Key Components
- **cn(...inputs)** — combines `clsx` + `tailwind-merge` for class composition with proper Tailwind precedence

## Dependencies
- External: `clsx`, `tailwind-merge`

## Integration
- Used throughout all components for conditional class names

## Conventions
- Always use `cn()` instead of string concatenation for Tailwind classes
- Add new shared utilities here
