# Module: Types

## Purpose

- TypeScript type definitions, constants, and enum-like arrays

## Responsibilities

- Define core data interfaces (User, AuthResponse, profiles)
- Define form data interfaces for signup flows
- Provide constant arrays for select options, labels, and icons

## Folder Structure

```
types/
├── index.ts          — Core types: User, UserRole, AuthResponse, profiles
├── creator.types.ts  — Creator constants, labels, icons, CreatorFormData
└── agency.types.ts   — Agency constants, labels, AgencyFormData
```

## Key Components

- **index.ts** — `UserRole`, `User`, `SocialAccount`, `CreatorProfile`, `AgencyProfile` (expanded to full Prisma model with nested `targetAudience`, `campaignPreferences`, `contact`), `AuthResponse`
- **creator.types.ts** — `SOCIAL_PLATFORMS`, `CREATOR_CATEGORIES`, `CATEGORY_LABELS`, `CATEGORY_ICONS`, `CONTENT_TYPES`, `RATE_RANGES`, `COLLABORATION_TYPES`, `AVAILABILITY_OPTIONS`, `TRAVEL_SCOPES`, `LANGUAGES`, `GENDER_OPTIONS`, `CreatorFormData`
- **agency.types.ts** — `INDUSTRY_CATEGORIES`, `COMPANY_SIZES`, `BUDGET_RANGES`, `PAYMENT_TYPES`, `PAYMENT_TIMELINES`, `FOLLOWER_RANGES`, `AGE_GROUPS`, `TARGET_GENDERS`, `TARGET_LOCATIONS`, `INCOME_BRACKETS`, `AgencyFormData`

## Dependencies

- None (leaf module)

## Integration

- Used by schemas (Zod validation), pages (form rendering), API endpoints (payload types)
- Constants used as `as const` readonly tuples for type inference

## Conventions

- Core shared types go in `index.ts`
- Domain-specific types/constants go in `{domain}.types.ts`
- Use `as const` for constant arrays to enable literal type inference
- Mirror backend Prisma enums as string constants
- Keep types in sync with backend DTOs and Prisma schema
