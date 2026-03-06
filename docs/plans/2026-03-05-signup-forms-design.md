# Signup Forms Design Document

> Date: 2026-03-05
> Spec: docs/plans/CollabHub_Signup_Forms_Spec.md

## Overview

Full-stack implementation of Creator and Brand/Agency multi-step signup wizards. Both are 5-step forms with per-step Zod validation, glassmorphism UI, slide transitions, and confetti on completion.

## Backend Changes

### Prisma Schema

**Expanded enums:**
- `CreatorCategory` -> 20 categories (Entertainment, Education, Finance, Technology, Lifestyle, Fitness, Travel, Food, Fashion, Gaming, Music, Photography, AI, Parenting, Pets, Sports, Comedy, Motivation, DIY, Automotive)
- `SocialPlatform` -> add LINKEDIN, BLOG
- New enums: `ContentType`, `CollaborationType`, `Availability`, `TravelScope`, `RateRange`, `IndustryCategory`, `CompanySize`, `BudgetRange`, `PaymentType`, `PaymentTimeline`, `FollowerRange`

**CreatorProfile model additions:**
- firstName, lastName (String, required)
- dateOfBirth (DateTime, replaces age)
- gender (String, optional)
- languages (String[])
- city, state, country (String)
- categories (CreatorCategory[]) — replaces single category
- contentTypes (ContentType[])
- portfolioUrl (String, optional)
- rateRange (RateRange)
- collaborationTypes (CollaborationType[])
- availability (Availability)
- willingToTravel (Boolean)
- travelScope (TravelScope, optional)
- previousCollaborations (Int, optional)
- notableBrands (String[])
- marketingEmails (Boolean)
- whatsappNotifications (Boolean)

**SocialAccount additions:**
- accountType (String, optional)

**AgencyProfile model additions:**
- companyLegalName (String)
- industry (IndustryCategory) — replaces productCategory
- companySize (CompanySize)
- yearFounded (Int, optional)
- gstin (String, optional)
- brandSocials (Json) — {instagram, youtube, twitter, facebook, linkedin}
- city, state, country, pinCode (location fields)
- targetAudience (Json) — {ageGroups, genders, locations, incomeBracket, languages}
- campaignPreferences (Json) — {platforms, contentTypes, budgetRange, paymentTypes, paymentTimeline, campaignsPerMonth, preferredFollowerRange, preferredCreatorCategories}
- marketingEmails (Boolean)

**AgencyContact additions:**
- designation required, add linkedinUrl

**User model additions:**
- firstName, lastName (optional, used by agency account manager)

### New API Endpoints

- `GET /auth/check-username/:username` — returns {available: boolean}
- `GET /auth/check-email/:email` — returns {available: boolean}
- Expand existing `POST /auth/register/creator` DTO
- Expand existing `POST /auth/register/agency` DTO

## Frontend Architecture

### Wizard Pattern

Single `useForm` instance per wizard. Per-step Zod schemas validated on "Next" click via `trigger()`. Steps share form state — back navigation preserves data.

### Component Tree

```
src/pages/signup/
  CreatorSignup.tsx, AgencySignup.tsx, EmailVerification.tsx
  components/
    ProgressBar.tsx, StepNavigator.tsx
    creator/ — 5 step components
    agency/ — 5 step components
    shared/ — 8 reusable components
src/schemas/
  creatorSignupSchema.ts, agencySignupSchema.ts
src/api/endpoints.ts — signup + availability check functions
src/types/ — update with form data types (inferred from Zod)
```

### New Packages

- `framer-motion` — step slide transitions
- `canvas-confetti` — success animation

### Styling

- Glassmorphism cards: `bg-white/80 backdrop-blur-lg border-white/20 rounded-2xl shadow-xl`
- Primary: purple-600, accent: blue-500
- Two-column desktop (left illustration, right form), single column mobile
- Floating label inputs, chip/tag selectors

### Validation

- `mode: 'onBlur'` for real-time field validation
- Debounced username check (500ms)
- Email availability check on blur
- Password strength meter (UI only, not Zod)
- Per-step schema validation on "Next"

### Out of Scope (YAGNI)

- Save & Continue Later (needs backend draft storage)
- Google Places autocomplete (simple text input instead)
- Image crop tool (basic upload + preview)
- WebSocket email verification (polling instead)
