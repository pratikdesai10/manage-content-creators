# Module: Schemas

## Purpose
- Zod validation schemas for forms across the app

## Responsibilities
- Define per-step validation rules for creator and agency signup
- Provide schema arrays for sequential step validation
- Define validation schema for login

## Folder Structure
```
schemas/
├── creatorSignupSchema.ts — 5-step creator Zod schemas
├── agencySignupSchema.ts  — 5-step agency Zod schemas
├── loginSchema.ts         — Login form schema (email + password min 8)
├── creatorEditSchema.ts   — Creator profile edit form schema
├── agencyEditSchema.ts    — Agency profile edit form schema
└── settingsSchema.ts      — Change password + update email schemas
```

## Key Components
- **loginSchema** — `{email: string().email(), password: string().min(8)}`; exports `LoginFormData` type
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
- **creatorEditSchema** — subset of creator signup (no email/password/terms): firstName, lastName, bio, profileImageUrl, socialAccounts (array min 1), categories (1-3), languages, city/state/country, contentTypes, portfolioUrl, rateRange, collaborationTypes, availability, willingToTravel, travelScope, previousCollaborations, notableBrands. Exports `CreatorEditFormData`.
- **agencyEditSchema** — subset of agency signup (no email/password/terms): contact person fields, brand details, brandSocials (nested URLs), location, targetAudience fields (flattened), campaignPreferences fields (flattened). Exports `AgencyEditFormData`.
- **changePasswordSchema** — currentPassword, newPassword (8+ chars, uppercase, lowercase, number, special char), confirmNewPassword with `.refine()` match. Exports `ChangePasswordFormData`.
- **updateEmailSchema** — `{newEmail: string().email()}`. Exports `UpdateEmailFormData`.

## Dependencies
- Internal: `types/creator.types`, `types/agency.types` (for enum arrays)
- External: `zod`

## Integration
- `loginSchema` imported by `Login.tsx`
- `creatorStepSchemas` / `agencyStepSchemas` imported by `CreatorSignup.tsx` / `AgencySignup.tsx`
- `creatorEditSchema` imported by `CreatorEditProfile.tsx`
- `agencyEditSchema` imported by `AgencyEditProfile.tsx`
- `changePasswordSchema` / `updateEmailSchema` imported by `Settings.tsx`
- Used with `@hookform/resolvers/zod` for per-step validation
- Schema index matches step index (0-based)

## Conventions
- One schema per step, exported individually and as array
- Use `.refine()` for cross-field validation (e.g., password confirmation)
- String enums validated with `z.enum()` using type constants
- Keep validation rules in sync with backend DTOs
