# Module: Utils

## Purpose
- Shared enums, constants, and validation functions

## Responsibilities
- Define all domain enums with display labels (mirroring backend Prisma enums)
- Define constant lists for form options (age groups, languages, etc.)
- Provide form field validators

## Folder Structure
```
utils/
├── enums.dart      — All domain enums + constants
└── validators.dart — Static validation methods
```

## Key Components
- **enums.dart** — Creator enums: `SocialPlatform`, `CreatorCategory`, `ContentType`, `RateRange`, `CollaborationType`, `Availability`, `TravelScope`. Agency enums: `IndustryCategory`, `CompanySize`, `BudgetRange`, `PaymentType`, `PaymentTimeline`, `FollowerRange`. Constants: `kAgeGroups`, `kTargetGenders`, `kTargetLocations`, `kLanguages`, `kIncomeBrackets`, `kCampaignsPerMonth`
- **Validators** — static methods: `email()`, `phone()`, `url()`, `required()`, `minLength()`, `maxLength()`, `password()` (8+ chars, upper, lower, digit, special), `confirmPassword()`, `displayName()`, `name()`, `bio()`, `description()`

## Dependencies
- None (leaf module)

## Integration
- Enums used in signup screens for form options and payload building
- Validators used in `TextFormField.validator` callbacks
- Enums mirror backend Prisma enums and frontend TypeScript constants

## Conventions
- All enums have a `label` getter for display text
- Keep enums in sync with backend `prisma/schema.prisma` and `frontend/src/types/`
- Constants prefixed with `k` (e.g., `kAgeGroups`)
- Validators return `String?` (null = valid, string = error message)
