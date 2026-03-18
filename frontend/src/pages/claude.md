# Module: Pages

## Purpose
- Route-level page components for the application

## Responsibilities
- Render page content for each route
- Orchestrate multi-step signup forms (creator + agency)
- Display dashboards for authenticated users

## Theme
All pages use dark glassmorphism theme. The `#050510` background, ParticleCanvas, and GlowOrbs are provided globally by `PageLayout` via `DarkBackground`. Pages do NOT render their own backgrounds — they inherit the dark theme from the layout.

**Design tokens used across all pages:**
- Glass card: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm`
- Gradient glass (hero/sidebar): `rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm`
- Dark input: `bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg`
- Primary button: `bg-gradient-to-r from-indigo-500 to-purple-600` with `shadow-lg shadow-indigo-500/25`
- Ghost button: `border border-white/20 text-white hover:bg-white/10`
- Chip inactive: `bg-white/5 border border-white/10 text-white/70`
- Chip active: `bg-indigo-500/20 border border-indigo-500/40 text-indigo-400`
- Framer Motion: most pages use `motion.div` with `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}`

## Folder Structure
```
pages/
├── Home.tsx              — Landing page orchestrator (imports all landing sections, dark theme wrapper)
├── Login.tsx             — Login form (react-hook-form + Zod, role-based redirect)
├── NotFound.tsx          — 404 page
├── landing/
│   ├── ParticleCanvas.tsx      — Full-viewport canvas with ~80 floating particles + connecting lines (30 on mobile, respects prefers-reduced-motion)
│   ├── GlowOrbs.tsx            — 3 absolute-positioned gradient blur orbs with CSS drift animation
│   ├── HeroSection.tsx         — CSS Grid container (1-col mobile, 2-col desktop) composing HeroContent + HeroCards
│   ├── HeroContent.tsx         — Left side: gradient headline, subtitle, two CTAs with Framer Motion fade-up
│   ├── HeroCards.tsx           — Right side: 3 floating mock cards with mouse parallax (CSS float fallback on touch)
│   ├── StatsBar.tsx            — 3 animated counters (10K+ Creators, 500+ Brands, $2M+ Paid Out) using useCountUp
│   ├── HowItWorks.tsx          — 3-step cards with staggered whileInView reveals
│   ├── FeaturesBentoGrid.tsx   — 6 feature cards in bento grid with 3D tilt on hover, glass-morphism
│   ├── CreatorShowcase.tsx     — Horizontal scrolling creator cards with mock data
│   └── FinalCTA.tsx            — Full-width gradient CTA section with two buttons
├── agencies/
│   └── AgencyPublicProfile.tsx — Read-only agency profile page (route: /agencies/:id) with hero, description, contact, target audience, campaign preferences, brand socials, edit button for own profile
├── Settings.tsx           — Account settings page (change password, update email, delete account — mocked APIs)
├── creators/
│   ├── CreatorDiscovery.tsx     — Creator marketplace with search, filters, and responsive grid
│   └── CreatorPublicProfile.tsx — Read-only creator profile page (route: /creators/:id) with hero, bio, socials, content/collab info, edit button for own profile
├── dashboard/
│   ├── CreatorDashboard.tsx     — Full creator dashboard (profile sidebar, stats, social reach, collabs, messages, detail panels)
│   ├── CreatorEditProfile.tsx   — Creator profile edit form (react-hook-form + Zod, TanStack Query fetch/update, useFieldArray for social accounts)
│   ├── AgencyDashboard.tsx      — Full agency dashboard (profile sidebar, stat cards with sparklines, budget overview, campaigns, messages, top creators, detail panels)
│   └── AgencyEditProfile.tsx    — Agency profile edit form (react-hook-form + Zod, TanStack Query fetch/update, 6 section cards)
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
- **AgencyDashboard** — full dashboard: AgencyProfileCard sidebar, AgencyStatCard × 4 (with SVG sparklines), BudgetOverview (horizontal bar chart), CampaignsList (clickable → CampaignDetailPanel), AgencyMessagesList (clickable → AgencyChatPanel floating widget), TopCreatorsList
  - `activePanel` state — `{type: 'campaign', id}` or `null`; `activeChat` state — `{messageId}` or `null`
  - Detail data fetched via TanStack Query on demand; side panels laid out in a CSS Grid 2-column when open
  - Total Spend formatted as INR with L/K suffixes; Messages card shows unread badge
- **CreatorEditProfile** — edit form for creator profile: fetches profiles via `getCreatorProfiles`, matches by `userId`, pre-fills with `mapProfileToForm`, `useFieldArray` for social accounts, chip toggles for categories/languages/contentTypes/collaborationTypes, comma-separated notable brands, submits via `updateCreatorProfile` mutation
- **AgencyEditProfile** — edit form for agency profile: fetches profiles via `getAgencyProfiles`, matches by `userId`, pre-fills with `mapProfileToForm`, validates with `agencyEditSchema` (Zod), submits via `updateAgencyProfile` mutation with `buildPayload` transform (nests contact, targetAudience, campaignPreferences). 6 sections: Contact Person, Brand Details, Brand Socials, Location, Target Audience (checkbox groups), Campaign Preferences (checkbox groups + dropdowns, creator categories max 5). Uses lucide-react icons per section.
- **CreatorDiscovery** — marketplace page: fetches all creators via `getCreatorProfiles`, client-side filtering (search, categories, platforms, rate, availability, follower range, city/state), collapsible filter panel with active filter count badge, responsive card grid linking to `/creators/:id`
- **CreatorPublicProfile** — read-only creator profile: fetches via `getCreatorProfile(id)` with TanStack Query, hero section (avatar/initials, display name, categories, location, availability), bio, social accounts with formatted follower counts, content & collaboration details, additional info (languages, notable brands, portfolio), edit button for own profile
- **AgencyPublicProfile** — read-only agency profile: fetches via `getAgencyProfile(id)`, hero (logo/initials, brand name, industry, company size, year founded, website), description, contact info, target audience, campaign preferences, brand socials, edit button for own profile
- **Settings** — account settings with 3 independent forms: Change Password (react-hook-form + Zod `changePasswordSchema`, show/hide toggle), Update Email (shows current email, `updateEmailSchema`), Delete Account (red warning card, inline "type DELETE" confirmation). All use mocked API endpoints with toast feedback.
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
- AgencyDashboard is fully implemented with profile sidebar (brand info, contact, platforms, budget), 4 stat cards with sparklines, budget overview bar chart, recent campaigns, recent messages, top creators, and clickable detail/chat panels
- AgencyDashboard uses mock data from backend (same pattern as creator dashboard)
- EmailVerification has a 60s countdown for resend, wired to `resendVerificationEmail()` mocked API with toast feedback
- CreatorDiscovery is fully implemented with search bar, multi-select category/platform chips, rate/availability/follower dropdowns, city/state text inputs, collapsible filter panel, active filter count badge, and responsive creator card grid
- CreatorPublicProfile is fully implemented: fetches via `getCreatorProfile(id)`, displays hero (avatar/initials, display name, categories, location, availability badge), bio, social accounts (platform, handle, formatted follower count, engagement rate), content & collaboration (content types, rate, collab types, travel), additional info (languages, previous collabs, notable brands, portfolio URL), edit button for own profile
- Settings page is fully implemented with 3 sections: Change Password (Zod validation, show/hide password), Update Email (shows current, Zod validation), Delete Account (red warning, inline "type DELETE" confirmation, calls logout + navigate on success). All use mocked API endpoints.
- Dashboard chat panels (both creator and agency) have wired send buttons that append messages locally (ephemeral) with toast feedback and auto-scroll
- Dashboard Edit Profile buttons are wired as Links to `/dashboard/creator/edit-profile` and `/dashboard/agency/edit-profile`
- AgencyPublicProfile is fully implemented: fetches agency via `getAgencyProfile(id)` with TanStack Query, displays hero (logo/initials, brand name, industry, company size, year founded, website), description, contact info, target audience chips, campaign preferences (platforms, content types, budget, payment, follower ranges, creator categories), brand socials links, and an Edit Profile button visible only to the profile owner
- CreatorEditProfile is fully implemented: fetches creator profiles via TanStack Query, finds current user's profile, pre-fills form via `reset()`, uses `useFieldArray` for dynamic social accounts, validates with `creatorEditSchema` (Zod), submits via `updateCreatorProfile` mutation, invalidates query cache on success, navigates back to dashboard. Sections: Personal Info, Social Accounts, Categories & Content (chip toggles), Collaboration (rate, availability, travel, notable brands as comma-separated input).
- AgencyEditProfile is fully implemented: fetches agency profiles via TanStack Query, finds current user's profile, pre-fills form via `reset(mapProfileToForm(...))`, validates with `agencyEditSchema` (Zod + zodResolver), submits via `updateAgencyProfile` mutation with `buildPayload` transform, invalidates `['agencies']` query cache on success, toasts and navigates to `/dashboard/agency`. 6 card sections with lucide-react icons: Contact Person, Brand Details (with industry/companySize dropdowns), Brand Socials (icon-prefixed URL inputs), Location, Target Audience (checkbox toggle groups for age/gender/location/language + income dropdown), Campaign Preferences (checkbox groups for platforms/contentTypes/paymentTypes/followerRange/creatorCategories with max 5 + budget/timeline/frequency dropdowns). Loading spinner and error/not-found states.
