# Dark Glassmorphism Redesign — Design Spec

## Overview

Redesign all CollabHub frontend pages to match the landing page's dark glassmorphism aesthetic. Every page gets the `#050510` dark background, particle canvas, glow orbs, glass cards, gradient accents, and Framer Motion animations — creating a unified, premium, 3D-website feel across the entire application.

## Decisions

- **Theme:** Full dark (`#050510`) everywhere — no light mode, no dual mode
- **Background effects:** Particle canvas + glow orbs on every page (reused from landing)
- **Navbar/Footer:** Always dark glass style (remove dual-mode conditional)
- **Approach:** Hybrid — shared background layer (particles/orbs/dark bg) extracted into layout, individual pages restyled with glass design tokens

## Architecture

### Shared Background Layer

Extract background effects into the existing `PageLayout` component:

```
PageLayout
├── DarkBackground (new — fixed position, z-0)
│   ├── ParticleCanvas (existing — reused from landing/)
│   └── GlowOrbs (existing — reused from landing/)
├── Navbar (updated — always dark)
├── <Outlet /> (z-10, relative)
└── Footer (updated — always dark)
```

**`DarkBackground` component** — new file at `components/layout/DarkBackground.tsx`:
- Renders `bg-[#050510]` as fixed full-screen background
- Renders `ParticleCanvas` and `GlowOrbs` (imported from `pages/landing/`)
- `z-0`, `fixed`, `inset-0`, `pointer-events-none`

**`PageLayout` update:**
- Add `DarkBackground` as first child
- Wrap `<Outlet />` in `relative z-10` container
- Add `text-white` to root
- Remove any light background classes

**`Home.tsx` update:**
- Remove its own `ParticleCanvas` and `GlowOrbs` rendering (now provided by layout)
- Keep `landing-page` wrapper class but remove `bg-[#050510]` (inherited from layout)
- Remove the `useEffect` that sets `document.body.style.backgroundColor` (no longer needed — layout owns the dark bg)

### Navbar Changes

File: `components/layout/Navbar.tsx`

Remove the `isLanding` conditional. Always use dark glass style:
- Container: `bg-[#050510]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50`
- Logo: `text-white` with gradient (`from-indigo-400 to-purple-400`)
- Nav links: `text-white/70 hover:text-white transition-colors`
- Avatar button: existing gradient circle (already works)
- Dropdown menu: `bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl`
- Dropdown items: `text-white/80 hover:bg-white/5 hover:text-white`
- Dropdown divider: `border-white/5`

### Footer Changes

File: `components/layout/Footer.tsx`

- Remove any light background
- Text: `text-gray-600` on transparent background (inherits dark from layout)
- Border top: `border-white/5`

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#050510` | Page background |
| Surface | `rgba(255,255,255,0.03)` / `bg-white/[0.03]` | Glass card background |
| Surface hover | `rgba(255,255,255,0.06)` / `bg-white/[0.06]` | Glass card hover |
| Surface elevated | `rgba(255,255,255,0.05)` / `bg-white/5` | Glass card (standard) |
| Surface elevated hover | `rgba(255,255,255,0.08)` / `bg-white/[0.08]` | Glass card hover (standard) |
| Border | `rgba(255,255,255,0.08)` / `border-white/[0.08]` | Card borders |
| Border strong | `rgba(255,255,255,0.1)` / `border-white/10` | Emphasized borders |
| Text primary | `#ffffff` | Headings, values |
| Text secondary | `#d1d5db` / `text-gray-300` | Body text |
| Text muted | `#9ca3af` / `text-gray-400` | Labels, descriptions |
| Text dim | `#6b7280` / `text-gray-500` | Timestamps, hints |
| Accent primary | `#818cf8` / `text-indigo-400` | Links, active states |
| Accent gradient | `from-indigo-500 to-purple-600` | Buttons, avatars |
| Success | `#34d399` / `text-emerald-400` | Available badges, positive stats |
| Warning | `#f59e0b` / `text-amber-400` | Pending states |
| Danger | `#ef4444` / `text-red-400` | Delete actions, errors |
| Danger surface | `rgba(239,68,68,0.04)` | Danger card bg |
| Danger border | `rgba(239,68,68,0.15)` | Danger card border |

### Glass Card Pattern

Standard glass card (used on all section containers):
```
rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm
hover:bg-white/[0.08] transition-colors duration-300
```

Gradient glass card (used on hero sections, profile sidebars):
```
rounded-2xl border border-indigo-500/20
bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10
backdrop-blur-sm
```

### Form Inputs

```
w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30
rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors
```

Textarea: same as input + `min-h-[80px] resize-vertical`

Select/dropdown: same as input + `appearance-none` with custom chevron

### Buttons

**Primary (gradient):**
```
bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold
rounded-xl px-6 py-2.5 shadow-lg shadow-indigo-500/25
hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40
hover:-translate-y-0.5 transition-all duration-300
```

**Secondary (ghost):**
```
border border-white/20 text-white font-semibold rounded-xl px-6 py-2.5
backdrop-blur-sm hover:bg-white/10 hover:border-white/30
hover:-translate-y-0.5 transition-all duration-300
```

**Danger:**
```
bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold
rounded-xl px-6 py-2.5 shadow-lg shadow-red-500/25
hover:from-red-600 hover:to-red-700 transition-all duration-300
```

### Chip/Toggle

**Inactive:**
```
px-3 py-1 rounded-full text-xs font-medium
bg-white/5 border border-white/10 text-white/70
hover:bg-white/[0.08] cursor-pointer transition-all
```

**Active:**
```
px-3 py-1 rounded-full text-xs font-medium
bg-indigo-500/20 border border-indigo-500/40 text-indigo-400
cursor-pointer transition-all
```

### Category Badge

```
px-2.5 py-0.5 rounded-full text-xs font-medium
bg-indigo-500/15 text-indigo-400
```

### Availability Badge

```
px-2.5 py-0.5 rounded-full text-xs font-medium
bg-emerald-500/10 text-emerald-400
```

### Status Badges

- Active/Success: `bg-emerald-500/10 text-emerald-400`
- Pending/Warning: `bg-amber-500/10 text-amber-400`
- Error/Danger: `bg-red-500/10 text-red-400`

## Animations

All pages use Framer Motion for entry animations. Patterns from landing page:

### Fade-Up Entry (page-level)
```tsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.7, ease: 'easeOut' }}
```

### Staggered Reveal (cards, list items)
```tsx
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5, delay: index * 0.1 }}
```

### Card Hover Effects
- Creator cards: `hover:translate-y-[-4px]` + `hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)]`
- Stat cards: `hover:bg-white/[0.08]` + `transition-colors duration-300`
- Glass cards: `hover:bg-white/[0.08]`

### Button Hover
- Rise: `hover:-translate-y-0.5`
- Shadow intensify: `hover:shadow-indigo-500/40`

## Page-by-Page Changes

### 1. Login (`pages/Login.tsx`)

- **Background:** Inherited from layout (particles + orbs)
- **Container:** Center card with `max-w-md mx-auto`
- **Card:** Glass card pattern (standard)
- **Heading:** `text-2xl font-bold text-white` centered
- **Subheading:** `text-gray-400 text-sm` centered
- **Inputs:** Dark input pattern (email, password)
- **Submit button:** Primary gradient, full width
- **Links:** `text-indigo-400 hover:text-indigo-300`
- **Animation:** Fade-up on mount

### 2. Creator Discovery (`pages/creators/CreatorDiscovery.tsx`)

- **Page heading:** `text-3xl font-bold text-white`
- **Search bar:** Dark input with search icon, full width
- **Filters button:** Ghost button with active count badge (`bg-indigo-500/20 text-indigo-400`)
- **Filter panel:** Glass card, collapsible
  - Category chips: chip toggle pattern
  - Platform chips: chip toggle pattern
  - Dropdowns (rate, availability, followers): dark select pattern
  - City/State inputs: dark input pattern
- **Creator cards:** Glass card with hover-lift + glow shadow
  - Avatar: gradient circle with initials
  - Name/handle: `text-white` / `text-gray-500`
  - Category badges: indigo badge pattern
  - Location: `text-gray-400` with map pin
  - Footer: follower count + availability badge
- **Loading state:** Indigo spinner on dark bg
- **Error state:** `text-red-400` centered with retry
- **Empty state:** `text-gray-500` centered
- **Animation:** Staggered reveal on card grid

### 3. Creator Public Profile (`pages/creators/CreatorPublicProfile.tsx`)

- **Back link:** `text-gray-400 hover:text-white`
- **Hero section:** Gradient glass card
  - Avatar: 96px gradient circle or image
  - Name: `text-2xl font-bold text-white`
  - Handle: `text-gray-400`
  - Categories: indigo badges
  - Location: `text-gray-400` with icon
  - Availability: emerald badge
- **Bio section:** Standard glass card, `text-gray-300` body
- **Social accounts:** Standard glass card, rows with `border-white/5` dividers
  - Platform icon/name: `text-white`
  - Handle: `text-gray-500`
  - Follower count: `text-white font-semibold`
  - Engagement rate: `text-gray-500`
- **Content & Collaboration:** Standard glass card
  - Section labels: `text-gray-400 text-sm font-medium`
  - Chip tags: inactive chip style
  - Values: `text-white`
- **Additional Info:** Standard glass card
- **Edit button:** Primary gradient, centered (own profile only)
- **Loading:** Indigo spinner
- **Error:** `text-gray-400` with back link
- **Animation:** Fade-up hero, staggered reveal for sections

### 4. Agency Public Profile (`pages/agencies/AgencyPublicProfile.tsx`)

Same patterns as Creator Public Profile with agency-specific fields:
- Hero: logo/initials, brand name, industry, company size, founded year, website link (`text-indigo-400`)
- Description section: glass card
- Contact info: glass card
- Target Audience: glass card with chip tags
- Campaign Preferences: glass card with chips, dropdowns display as text
- Brand Socials: glass card with external links (`text-indigo-400 hover:text-indigo-300`)
- Edit button: primary gradient (own profile only)

### 5. Creator Dashboard (`pages/dashboard/CreatorDashboard.tsx`)

- **Layout:** CSS Grid — `grid-cols-[280px_1fr]` on desktop, stacked on mobile
- **Profile sidebar:** Gradient glass card
  - Avatar, name, categories, location, social reach
  - Edit Profile: primary gradient button, full width
- **Stat cards:** 3-column grid, glass card pattern
  - Emoji icon + label: `text-gray-400`
  - Value: `text-3xl font-bold text-white`
  - Trend badge: `bg-emerald-500/10 text-emerald-400`
  - Sparkline SVG: existing pattern with gradient fill, colors: indigo/emerald/sky
- **Social Reach section:** glass card, horizontal bars with gradient fills
- **Recent Collaborations:** glass card, list rows with `border-white/5` dividers
  - Brand logo: rounded-lg with gradient bg
  - Status badges: success/warning/danger patterns
- **Recent Messages:** glass card, list rows
  - Avatar: gradient circle
  - Preview text: `text-gray-500` truncated
  - Timestamp: `text-gray-600`
- **Detail panels:** glass card, slide-in with Framer Motion
- **Chat panel:** floating glass card, bottom-right
  - Messages: alternating alignment, glass bubble for received, gradient bubble for sent
  - Input: dark input + primary send button

### 6. Agency Dashboard (`pages/dashboard/AgencyDashboard.tsx`)

Same structural patterns as Creator Dashboard with agency-specific content:
- 4 stat cards (Active Campaigns, Creators Contacted, Total Spend, Messages)
- Budget Overview: glass card with horizontal bar chart (gradient fills)
- Recent Campaigns list, Recent Messages list, Top Creators list
- Campaign detail panel, chat panel

### 7. Creator Edit Profile (`pages/dashboard/CreatorEditProfile.tsx`)

- **Page heading:** `text-2xl font-bold text-white`
- **Form sections:** Glass cards with icon headers
  - Personal Info: dark inputs in 2-col grid
  - Social Accounts: `useFieldArray` rows in nested glass containers (`bg-white/[0.03] border-white/[0.06]`)
    - Add button: ghost style
    - Remove button: `text-red-400 hover:text-red-300`
  - Categories & Content: chip toggles (active = indigo pattern)
  - Collaboration: dark inputs/selects, chip toggles
- **Form actions:** ghost Cancel + primary Save, right-aligned
- **Loading:** indigo spinner
- **Error:** `text-red-400` with back link
- **Animation:** Staggered reveal for sections

### 8. Agency Edit Profile (`pages/dashboard/AgencyEditProfile.tsx`)

Same form patterns as Creator Edit Profile with 6 sections:
- Contact Person, Brand Details, Brand Socials, Location, Target Audience (checkbox groups as chip toggles), Campaign Preferences (chip toggles + dark selects)
- All sections in glass cards with lucide-react icon headers

### 9. Settings (`pages/Settings.tsx`)

- **Page heading:** `text-2xl font-bold text-white`
- **Change Password:** Glass card, dark inputs, show/hide toggle (`text-gray-400`), primary button
- **Update Email:** Glass card, current email in `text-gray-300 font-medium`, dark input, primary button
- **Delete Account:** Red-tinted card (`bg-red-500/[0.04] border border-red-500/15`)
  - Warning box: `bg-red-500/[0.08] border-red-500/20 text-red-300`
  - Delete button: danger gradient
  - Confirmation input: dark input with red focus ring

### 10. Email Verification (`pages/signup/EmailVerification.tsx`)

- **Centered glass card:** `max-w-md`, elevated glass with stronger blur
- **Icon:** Gradient circle with envelope icon
- **Heading:** `text-2xl font-bold text-white`
- **Description:** `text-gray-400`
- **Resend button:** Primary gradient, disabled state with `opacity-50`
- **Login link:** `text-indigo-400 hover:text-indigo-300`

### 11. Signup Wizards (`pages/signup/CreatorSignup.tsx`, `AgencySignup.tsx`)

- **Progress bar:** Glass strip with gradient fill for completed steps, `bg-white/10` for pending
- **Step container:** Glass card for each step's form content
- **All inputs:** Dark input pattern
- **Step navigation:** Ghost Back + Primary Next/Submit
- **Shared components update:**
  - `PasswordStrengthMeter`: bars use `bg-white/10` inactive, gradient fill for strength
  - `PhoneInput`: dark input with `+91` prefix in `text-gray-400`
  - `CategorySelector`: chip toggle pattern
  - `ImageUpload`: glass card with dashed `border-white/10`, hover `border-indigo-500/30`
  - `SocialAccountEntry`: nested glass container
  - `ChipMultiSelect`: chip toggle pattern
  - `TermsAccordion`: glass card, `text-gray-300` content
  - `TermsCheckboxGroup`: custom checkbox with `accent-indigo-500`
- **Framer Motion slide transitions:** keep existing, update bg colors
- **Confetti:** keep existing

### 12. 404 / NotFound Page

- **Centered layout:** Glass card or raw text
- **Heading:** `text-6xl font-bold gradient-text` for "404"
- **Subtitle:** `text-gray-400`
- **Home link:** Primary gradient button

## Files Changed

### New Files
- `frontend/src/components/layout/DarkBackground.tsx`

### Modified Files (Layout)
- `frontend/src/components/layout/PageLayout.tsx`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/layout/Footer.tsx`

### Modified Files (Pages)
- `frontend/src/pages/Home.tsx` (remove redundant bg/particles)
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Settings.tsx`
- `frontend/src/pages/NotFound.tsx`
- `frontend/src/pages/creators/CreatorDiscovery.tsx`
- `frontend/src/pages/creators/CreatorPublicProfile.tsx`
- `frontend/src/pages/agencies/AgencyPublicProfile.tsx`
- `frontend/src/pages/dashboard/CreatorDashboard.tsx`
- `frontend/src/pages/dashboard/AgencyDashboard.tsx`
- `frontend/src/pages/dashboard/CreatorEditProfile.tsx`
- `frontend/src/pages/dashboard/AgencyEditProfile.tsx`
- `frontend/src/pages/signup/EmailVerification.tsx`
- `frontend/src/pages/signup/CreatorSignup.tsx`
- `frontend/src/pages/signup/AgencySignup.tsx`
- `frontend/src/pages/signup/components/ProgressBar.tsx`
- `frontend/src/pages/signup/components/StepNavigator.tsx`
- `frontend/src/pages/signup/components/shared/PasswordStrengthMeter.tsx`
- `frontend/src/pages/signup/components/shared/PhoneInput.tsx`
- `frontend/src/pages/signup/components/shared/CategorySelector.tsx`
- `frontend/src/pages/signup/components/shared/ImageUpload.tsx`
- `frontend/src/pages/signup/components/shared/SocialAccountEntry.tsx`
- `frontend/src/pages/signup/components/shared/ChipMultiSelect.tsx`
- `frontend/src/pages/signup/components/shared/TermsAccordion.tsx`
- `frontend/src/pages/signup/components/shared/TermsCheckboxGroup.tsx`
- All step components in `signup/components/creator/` and `signup/components/agency/`

## Implementation Order

1. Shared infrastructure (DarkBackground, PageLayout, Navbar, Footer)
2. Home.tsx cleanup (remove redundant particles/orbs)
3. Login page
4. Settings page
5. Email Verification page
6. Creator Discovery page
7. Creator Public Profile page
8. Agency Public Profile page
9. Creator Dashboard
10. Agency Dashboard
11. Creator Edit Profile
12. Agency Edit Profile
13. Signup wizards + shared components
14. NotFound page
15. Build verification

## Testing

- `npm run build` after each major page to catch TypeScript/import errors
- Visual review via Playwright after each batch of pages
- Verify particle canvas doesn't duplicate (layout provides it, pages don't)
- Verify Navbar dropdown works on dark theme
- Verify form inputs are readable (contrast check: white text on dark bg)
- Verify Framer Motion animations don't conflict with layout-level particles
