# Module: Schemas

## Purpose
- Zod validation schemas for multi-step signup forms

## Responsibilities
- Define per-step validation rules for creator and agency signup
- Provide schema arrays for sequential step validation

## Folder Structure
```
schemas/
├── creatorSignupSchema.ts — 5-step creator Zod schemas
└── agencySignupSchema.ts  — 5-step agency Zod schemas
```

## Key Components
- **creatorStepSchemas** — array of 5 Zod schemas:
  1. Personal info (name, email, password with match refinement, DOB)
  2. Social accounts (array, min 1, nested platform/handle/followerCount)
  3. Profile (categories 1-3, bio 50-500, languages, location, contentTypes)
  4. Collaboration (rateRange, collaborationTypes, availability, travel)
  5. Terms (4 required booleans, 2 optional)
- **agencyStepSchemas** — array of 5 Zod schemas:
  1. Account manager (name, email, password, phone, designation)
  2. Brand details (name, website URL, industry, companySize, description 50-500, brandSocials)
  3. Location + audience (city/state/country, targetAgeGroups, genders, locations, languages)
  4. Campaign prefs (platforms, contentTypes, budget, payment, followerRange, categories 1-5)
  5. Terms (5 required booleans, 1 optional)

## Dependencies
- Internal: `types/creator.types`, `types/agency.types` (for enum arrays)
- External: `zod`

## Integration
- Imported by `CreatorSignup.tsx` and `AgencySignup.tsx`
- Used with `@hookform/resolvers/zod` for per-step validation
- Schema index matches step index (0-based)

## Conventions
- One schema per step, exported individually and as array
- Use `.refine()` for cross-field validation (e.g., password confirmation)
- String enums validated with `z.enum()` using type constants
- Keep validation rules in sync with backend DTOs
