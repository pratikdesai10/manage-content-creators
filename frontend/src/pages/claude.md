# Module: Pages

## Purpose
- Route-level page components for the application

## Responsibilities
- Render page content for each route
- Orchestrate multi-step signup forms (creator + agency)
- Display dashboards for authenticated users

## Folder Structure
```
pages/
├── Home.tsx              — Landing page with CTAs
├── Login.tsx             — Login form (react-hook-form + Zod, role-based redirect)
├── NotFound.tsx          — 404 page
├── dashboard/
│   ├── CreatorDashboard.tsx — Full creator dashboard (profile sidebar, stats, social reach, collabs, messages, detail panels)
│   └── AgencyDashboard.tsx  — Agency stats (placeholder)
└── signup/
    ├── CreatorSignup.tsx     — 5-step creator registration form
    ├── AgencySignup.tsx      — 5-step agency registration form
    ├── EmailVerification.tsx — Post-signup verification page
    └── components/
        ├── ProgressBar.tsx   — Step indicator (clickable for back)
        ├── StepNavigator.tsx — Back/Next/Submit buttons
        ├── creator/
        │   ├── PersonalInfoStep.tsx      — Step 1: name, email, password, DOB
        │   ├── SocialMediaStep.tsx       — Step 2: social accounts array
        │   ├── ProfileCategoriesStep.tsx — Step 3: categories, bio, location
        │   ├── CollaborationPrefsStep.tsx — Step 4: rates, availability
        │   └── CreatorReviewStep.tsx     — Step 5: review + terms
        ├── agency/
        │   ├── AccountManagerStep.tsx    — Step 1: contact person info
        │   ├── BrandDetailsStep.tsx      — Step 2: company info
        │   ├── LocationAudienceStep.tsx  — Step 3: location + target audience
        │   ├── CampaignPrefsStep.tsx     — Step 4: campaign preferences
        │   └── AgencyReviewStep.tsx      — Step 5: review + terms
        └── shared/
            ├── PasswordStrengthMeter.tsx — Weak/medium/strong indicator
            ├── PhoneInput.tsx           — Indian phone input (+91)
            ├── CategorySelector.tsx     — Grid selector (max 3)
            ├── ImageUpload.tsx          — Drag-and-drop image upload
            ├── SocialAccountEntry.tsx   — Single social account form row
            ├── ChipMultiSelect.tsx      — Toggle chip selector
            ├── TermsAccordion.tsx       — Collapsible terms text
            └── TermsCheckboxGroup.tsx   — Required/optional checkboxes
```

## Key Components
- **Login** — react-hook-form + Zod (`loginSchema`), calls `login()` API, updates Zustand store, redirects based on `user.role`
- **CreatorDashboard** — full dashboard: ProfileCard sidebar, StatCard × 3 (with SVG sparklines), SocialReach bars (clickable → SocialDetailPanel), CollaborationsList (clickable → CollabDetailPanel), MessagesList (clickable → ChatPanel floating widget)
  - `activePanel` state — `{type: 'collab'|'social', id}` or `null`; `activeChat` state — `{messageId}` or `null`
  - Detail data fetched via TanStack Query on demand; side panels laid out in a CSS Grid 2-column when open
- **CreatorSignup / AgencySignup** — multi-step form orchestrators using react-hook-form + Zod
  - Manages `currentStep`, `direction` (animation), `isSubmitting`
  - Per-step Zod validation via `creatorStepSchemas[]` / `agencyStepSchemas[]`
  - Framer Motion slide transitions between steps
  - Confetti on successful submission
  - Navigates to `/signup/verify-email` on success

## Data Flow
- User fills step → Next click → validate current step schema → advance
- Final step → Submit → call `registerCreator/registerAgency` API → success → verify-email page
- Backend errors mapped to form field errors via `setError()`

## Dependencies
- Internal: `api/endpoints`, `schemas/*`, `types/*`, `hooks/useAuth`, `stores/authStore`
- External: `react-hook-form`, `@hookform/resolvers/zod`, `framer-motion`, `canvas-confetti`, `react-hot-toast`, `lucide-react`

## Conventions
- Step components receive `control`, `errors`, `watch`, `setValue`, `trigger` from parent form
- Shared form components go in `signup/components/shared/`
- Each signup flow has its own step components in `creator/` or `agency/`
- Username/email checks are debounced (500ms) in PersonalInfoStep

## Developer Notes
- Login page is fully implemented with react-hook-form + Zod (`loginSchema`), role-based redirect to creator/agency dashboard on success, API error display, and show/hide password toggle
- CreatorDashboard is fully implemented with profile sidebar, stat cards with sparklines, social reach bars, collaborations list, messages list, and clickable detail panels
- Dashboard detail panels open inline (collab/social) or as floating bottom-right widget (chat/message thread); clicking same item toggles panel closed
- EmailVerification has a 60s countdown for resend
