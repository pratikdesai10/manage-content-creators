# Frontend Full Buildout — Design Spec

## Overview

Build the remaining frontend pages for CollabHub: creator discovery marketplace, public profiles (creator + agency), profile editing (creator + agency), account settings, email verification polish, and chat send functionality.

**Scope:** Frontend only. Mock API calls where backend endpoints don't exist yet.

---

## Prerequisite: Type Updates

The current `CreatorProfile` and `SocialAccount` interfaces in `types/index.ts` are incomplete compared to the Prisma schema. The backend `GET /creators` and `GET /creators/:id` endpoints return ALL fields. These must be updated before building any new pages.

### CreatorProfile — expand to match backend response

```typescript
export interface CreatorProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName: string
  dateOfBirth: string
  gender: string | null
  profileImageUrl: string | null
  bio: string
  languages: string[]
  city: string
  state: string
  country: string
  categories: string[]          // was "niche" — renamed to match Prisma
  contentTypes: string[]
  portfolioUrl: string | null
  rateRange: string
  collaborationTypes: string[]
  availability: string
  willingToTravel: boolean
  travelScope: string | null
  previousCollaborations: number | null
  notableBrands: string[]
  marketingEmails: boolean
  whatsappNotifications: boolean
  socialAccounts: SocialAccount[]
  user: User
}
```

**Breaking change:** `niche` → `categories`, `location` → `city`/`state`/`country`. The existing `CreatorDashboard.tsx` references these old field names and must be updated.

### SocialAccount — expand to match backend response

```typescript
export interface SocialAccount {
  id: string
  creatorProfileId: string      // was "creatorId"
  platform: string
  handle: string
  profileUrl: string | null
  followerCount: number
  isVerified: boolean
  accountType: string | null
  engagementRate: number
  avgLikes: number
  growthPercent: number
  topContentType: string | null
}
```

### User — add `isVerified`, remove `updatedAt` from safe select

The backend's `USER_SAFE_SELECT` returns `{id, email, role, isVerified, createdAt}` — no `updatedAt`.

```typescript
export interface User {
  id: string
  email: string
  role: UserRole
  isVerified: boolean
  createdAt: string
}
```

### Dashboard field reference updates

After renaming `niche` → `categories` and `location` → `city`/`state`/`country`:
- `CreatorDashboard.tsx` ProfileCard: update references from `profile.niche` to `profile.categories`, from `profile.location` to `${profile.city}, ${profile.state}`
- Any other component referencing these old fields

---

## Pages

### 1. Creator Discovery (`/creators`)

**Purpose:** Agencies (and creators) browse and search for creators to collaborate with.

**Route:** `/creators` — protected (any authenticated role).

**Data Source:** `GET /creators` returns all creator profiles with full fields. Filtering is client-side since no server-side filter endpoint exists.

**Layout:**
- Top: Search bar (search by display name) + filter toggle button with active filter count badge
- Filter panel (collapsible): category, platform, location (city/state), rate range, availability, follower range
- Below: Responsive grid of creator cards (3 cols desktop, 2 tablet, 1 mobile)
- Loading state: "Loading creators..." centered text
- Empty state: "No creators match your filters" with clear filters button
- Error state: "Failed to load creators" with retry button

**Creator Card Contents:**
- Avatar (initials from firstName/lastName with gradient, or profileImageUrl)
- Display name
- Top category tag (first from `categories[]`)
- Location (`city, state`)
- Primary platform (highest follower count from `socialAccounts[]`) + follower count
- Rate range badge (using `RATE_RANGE_LABELS`)
- Availability indicator (using `AVAILABILITY_LABELS`)
- Click → navigates to `/creators/:profileId`

**Filter Controls:**
- Category: multi-select chips (reuse `CREATOR_CATEGORIES` + `CATEGORY_LABELS` from `creator.types.ts`)
- Platform: multi-select chips (reuse `SOCIAL_PLATFORMS` from `creator.types.ts`)
- Rate range: dropdown (reuse `RATE_RANGES` + `RATE_RANGE_LABELS`)
- Availability: dropdown (reuse `AVAILABILITY_OPTIONS` + `AVAILABILITY_LABELS`)
- Follower range: dropdown using existing `FOLLOWER_RANGES` constant from `agency.types.ts` (NANO=1K-10K, MICRO=10K-50K, MID_TIER=50K-500K, MACRO=500K-1M, MEGA=1M+, ANY). Filter by checking if any of the creator's `socialAccounts` has a `followerCount` within the selected range.
- Location: text inputs for city/state (case-insensitive partial match)
- Clear all filters button
- Active filter count badge on filter toggle button

**Data Fetching:**
```typescript
const { data: creators, isLoading, error } = useQuery({
  queryKey: ['creators'],
  queryFn: getCreatorProfiles,
})
// Client-side filter the creators array based on active filters
const filtered = useMemo(() => applyFilters(creators, filters), [creators, filters])
```

---

### 2. Creator Public Profile (`/creators/:id`)

**Purpose:** View a creator's full profile (read-only).

**Route:** `/creators/:id` — protected (any authenticated role). The `:id` is the creator profile ID (not user ID).

**Data Source:** `GET /creators/:id` — new endpoint function `getCreatorProfile(id)` in `endpoints.ts`.

**Layout:**
- Hero section: avatar (profileImageUrl or initials), display name, `firstName lastName`, bio, location (`city, state, country`), availability badge, rate range badge
- Social accounts section: cards per account showing platform icon, handle, follower count, engagement rate
- Content & Categories section: category tags (using `CATEGORY_LABELS`), content type tags
- Collaboration section: collaboration types, travel willingness + scope, notable brands as chips
- Portfolio link (if `portfolioUrl` exists): external link button (opens in new tab)
- Back button → `/creators`

**Own profile detection:** If `profile.userId === currentUser.id`, show an "Edit Profile" button linking to `/dashboard/creator/edit-profile`.

**States:**
- Loading: "Loading profile..." centered text
- 404 / error: "Creator not found" with back button to `/creators`

---

### 3. Agency Public Profile (`/agencies/:id`)

**Purpose:** View an agency's full profile (read-only).

**Route:** `/agencies/:id` — protected (any authenticated role). The `:id` is the agency profile ID.

**Data Source:** `GET /agencies/:id` — new endpoint function `getAgencyProfile(id)` in `endpoints.ts`.

**Layout:**
- Hero section: logo (`logoUrl` or initials), brand name, industry tag (using `INDUSTRY_LABELS`), company size (using `COMPANY_SIZE_LABELS`), year founded, website link (external)
- Description section
- Contact section: contact person name, designation, email (from `profile.contact`)
- Target audience section: age groups, genders, locations, income bracket, languages (from `profile.targetAudience`)
- Campaign preferences: platforms, content types, budget range, payment terms, follower preferences, creator category preferences (from `profile.campaignPreferences`)
- Brand socials: links to social profiles (from `profile.brandSocials`)

**Own profile detection:** If `profile.userId === currentUser.id`, show an "Edit Profile" button linking to `/dashboard/agency/edit-profile`.

**How users reach this page:** Agency profile links appear in:
- Creator dashboard's collaboration detail panels (brand name links)
- Creator discovery cards could show "View Agency" links in the future
- Direct URL navigation

**States:**
- Loading: "Loading profile..." centered text
- 404 / error: "Agency not found" with back button to home

---

### 4. Creator Profile Edit (`/dashboard/creator/edit-profile`)

**Purpose:** Edit creator profile data.

**Route:** `/dashboard/creator/edit-profile` — protected, CREATOR role only.

**Profile ID Resolution:** Fetch via `GET /creators`, find profile where `profile.userId === currentUser.id`, extract `profile.id`. This follows the same pattern the dashboard already uses. Cache the profile list query (`queryKey: ['creators']`) so it's shared with the dashboard.

**Data Source:**
- Read: `GET /creators` → find current user's profile → get profile ID
- Write: `PATCH /creators/:id` — endpoint exists in backend

**Layout:** Single scrollable form page with sections (not multi-step). Cancel button returns to dashboard.

1. **Personal Info** — display name (read-only, shown as disabled input), first name, last name, bio (textarea with counter), profile image (reuse `ImageUpload`)
2. **Social Accounts** — dynamic list using `useFieldArray` (reuse `SocialAccountEntry` component)
3. **Profile & Categories** — categories (reuse `CategorySelector`, max 3), languages (reuse `ChipMultiSelect`), location (city/state/country inputs), content types (reuse `ChipMultiSelect`)
4. **Collaboration Preferences** — rate range (dropdown), collaboration types (reuse `ChipMultiSelect`), availability (dropdown), willing to travel toggle + travel scope, notable brands (tag input)

**Form Handling:**
- `react-hook-form` + Zod schema (new `creatorEditSchema.ts` — subset of signup schemas, no password/email/terms)
- Pre-fill: `useEffect` watches profile data, calls `form.reset(mapProfileToFormData(profile))` when loaded
- Submit button: shows "Saving..." + disabled during submission (using `isSubmitting` from form state)
- Submit → `useMutation` calling `PATCH /creators/:id` with form data
- `onSuccess` → toast "Profile updated" + `queryClient.invalidateQueries({ queryKey: ['creators'] })` + navigate to dashboard
- `onError` → toast with API error message
- Prevent double-submit via `isSubmitting` check

**Reused Components:** CategorySelector, ChipMultiSelect, SocialAccountEntry, ImageUpload

---

### 5. Agency Profile Edit (`/dashboard/agency/edit-profile`)

**Purpose:** Edit agency profile data.

**Route:** `/dashboard/agency/edit-profile` — protected, AGENCY role only.

**Profile ID Resolution:** Same pattern — `GET /agencies` → find by `userId` → get `profile.id`.

**Data Source:**
- Read: `GET /agencies` → find current user's profile
- Write: `PATCH /agencies/:id` — endpoint exists in backend

**Layout:** Single scrollable form page with sections. Cancel button returns to dashboard.

1. **Contact Person** — name, designation, email, phone (reuse `PhoneInput`), LinkedIn URL
2. **Brand Details** — brand name, legal name, website, logo (reuse `ImageUpload`), industry (dropdown), company size (dropdown), year founded, GSTIN, description (textarea with counter), brand socials (collapsible section with URL inputs)
3. **Location & Audience** — location fields (city/state/country/pin), target audience: age groups, genders, locations, income bracket, languages (all using `ChipMultiSelect`)
4. **Campaign Preferences** — platforms, content types, budget range, payment types/timeline, campaigns per month, follower ranges, creator categories (using `ChipMultiSelect`)

**Form Handling:** Same pattern as creator edit:
- react-hook-form + Zod (`agencyEditSchema.ts`)
- Pre-fill via `form.reset()`
- `useMutation` for PATCH
- `onSuccess` → invalidate queries + toast + navigate
- Submit button disabled during submission

**Payload transformation:** Same as signup — nest `targetAudience` and `campaignPreferences` into the backend's expected shape before sending.

**Reused Components:** ChipMultiSelect, ImageUpload, PhoneInput

---

### 6. Settings (`/settings`)

**Purpose:** Account-level settings (not profile-related).

**Route:** `/settings` — protected (any authenticated role).

**Sections:**

1. **Change Password**
   - Current password, new password (reuse `PasswordStrengthMeter`), confirm new password
   - Validation: Zod schema (inline or in `settingsSchema.ts`) — current password required, new password same complexity rules as signup, confirm must match
   - Submit button disabled during submission
   - Submit → mock API call → toast "Password changed successfully"

2. **Update Email**
   - Current email (read-only display from `user.email`), new email input
   - Validation: valid email format
   - Submit → mock API call → toast "Verification email sent to new address"

3. **Delete Account**
   - Danger zone section (red border, red heading)
   - "Delete Account" button → confirmation modal with text input ("Type DELETE to confirm")
   - Modal has Cancel and Confirm buttons. Confirm disabled until input matches "DELETE"
   - Submit → mock API call → `logout()` from Zustand → navigate to `/`

**All API calls are mocked** — `console.log` + `await new Promise(r => setTimeout(r, 500))` + toast. Clearly labeled with `// TODO: wire to real endpoint when backend adds support`.

---

### 7. Email Verification Polish (`/signup/verify-email`)

**Changes to existing page:**
- Wire resend button: call mock `resendVerificationEmail()` → toast "Verification email resent!" + reset 60s timer
- No structural changes needed

---

### 8. Dashboard Chat Send (`CreatorDashboard.tsx`, `AgencyDashboard.tsx`)

**Changes to existing chat widgets:**
- On send (button click or Enter key):
  - Append draft message to the local thread array as a new `MessageThreadEntry`
  - Sender value: `'CREATOR'` in CreatorDashboard, `'BRAND'` in AgencyDashboard
  - `sentAt`: current ISO timestamp
  - Clear input, auto-scroll to bottom
  - Toast: "Message sent"
- **Important note:** These messages are ephemeral — they exist only in local React state and will disappear on navigation, page refresh, or query refetch. This is a UI demo only, not functional chat. No actual API call is made.

---

## New Files

```
frontend/src/pages/
├── creators/
│   ├── CreatorDiscovery.tsx      — Browse/search page with filters
│   └── CreatorPublicProfile.tsx  — View-only creator profile
├── agencies/
│   └── AgencyPublicProfile.tsx   — View-only agency profile
├── dashboard/
│   ├── CreatorEditProfile.tsx    — Edit form for creator
│   └── AgencyEditProfile.tsx     — Edit form for agency
└── Settings.tsx                  — Account settings (password, email, delete)

frontend/src/schemas/
├── creatorEditSchema.ts          — Zod schema for creator edit form
├── agencyEditSchema.ts           — Zod schema for agency edit form
└── settingsSchema.ts             — Zod schemas for password change + email update
```

## Modified Files

```
frontend/src/types/index.ts                   — Expand CreatorProfile, SocialAccount, User types
frontend/src/App.tsx                           — Add new routes
frontend/src/api/endpoints.ts                  — Add new endpoint functions
frontend/src/pages/signup/EmailVerification.tsx — Wire resend button
frontend/src/pages/dashboard/CreatorDashboard.tsx — Fix field references (niche→categories, location→city/state), chat send, Edit Profile link
frontend/src/pages/dashboard/AgencyDashboard.tsx  — Chat send, Edit Profile link
frontend/src/components/layout/Navbar.tsx       — Add "Discover" nav link, update "View Profile" dropdown link
frontend/src/pages/claude.md                    — Update module docs
frontend/src/types/claude.md                    — Update module docs
```

## New API Functions (endpoints.ts)

```typescript
// Real endpoints (backend exists):
export async function getCreatorProfile(id: string): Promise<CreatorProfile>
  // GET /creators/:id — returns single creator with socialAccounts + user

export async function getAgencyProfile(id: string): Promise<AgencyProfile>
  // GET /agencies/:id — returns single agency with contact + user

export async function updateCreatorProfile(id: string, data: Partial<CreatorProfile>): Promise<CreatorProfile>
  // PATCH /creators/:id

export async function updateAgencyProfile(id: string, data: Partial<AgencyProfile>): Promise<AgencyProfile>
  // PATCH /agencies/:id

// Mocked endpoints (no backend yet):
export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>
  // TODO: wire to real endpoint
  // Mock: console.log + 500ms delay

export async function updateEmail(data: { newEmail: string }): Promise<void>
  // TODO: wire to real endpoint
  // Mock: console.log + 500ms delay

export async function deleteAccount(): Promise<void>
  // TODO: wire to real endpoint
  // Mock: console.log + 500ms delay

export async function resendVerificationEmail(): Promise<void>
  // TODO: wire to real endpoint
  // Mock: console.log + 500ms delay
```

## Route Structure (App.tsx)

```typescript
<Route element={<PageLayout />}>
  {/* Public */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup/creator" element={<CreatorSignup />} />
  <Route path="/signup/agency" element={<AgencySignup />} />
  <Route path="/signup/verify-email" element={<EmailVerification />} />

  {/* Protected — any role */}
  <Route element={<ProtectedRoute />}>
    <Route path="/creators" element={<CreatorDiscovery />} />
    <Route path="/creators/:id" element={<CreatorPublicProfile />} />
    <Route path="/agencies/:id" element={<AgencyPublicProfile />} />
    <Route path="/settings" element={<Settings />} />

    {/* CREATOR only */}
    <Route element={<RoleRoute role="CREATOR" />}>
      <Route path="/dashboard/creator" element={<CreatorDashboard />} />
      <Route path="/dashboard/creator/edit-profile" element={<CreatorEditProfile />} />
    </Route>

    {/* AGENCY only */}
    <Route element={<RoleRoute role="AGENCY" />}>
      <Route path="/dashboard/agency" element={<AgencyDashboard />} />
      <Route path="/dashboard/agency/edit-profile" element={<AgencyEditProfile />} />
    </Route>
  </Route>

  <Route path="*" element={<NotFound />} />
</Route>
```

Note: Single `<ProtectedRoute>` wrapper with nested `<RoleRoute>` children, rather than three separate wrappers.

## Navbar Updates

For authenticated users:
1. Add a "Discover" link pointing to `/creators` between the logo and Dashboard link
2. Update the "View Profile" dropdown link to point to the user's own public profile (`/creators/:profileId` or `/agencies/:profileId`) instead of the dashboard. This requires knowing the profile ID — fetch from the same cached `['creators']` or `['agencies']` query.

## Cache Invalidation Strategy

After profile edits, invalidate the relevant TanStack Query cache keys so dashboard and other views show fresh data:

```typescript
// After creator profile edit
queryClient.invalidateQueries({ queryKey: ['creators'] })
queryClient.invalidateQueries({ queryKey: ['creator', profileId] })

// After agency profile edit
queryClient.invalidateQueries({ queryKey: ['agencies'] })
queryClient.invalidateQueries({ queryKey: ['agency', profileId] })
```

## Patterns to Follow

- **Data fetching:** TanStack Query with `useQuery` / `useMutation` (same staleTime/retry as existing)
- **Forms:** react-hook-form + zodResolver (same as login/signup)
- **Styling:** Tailwind CSS, white bg pages (not dark theme — dark is landing only)
- **Animations:** Framer Motion `whileInView` for section reveals where appropriate
- **Loading states:** Text placeholder ("Loading...") matching dashboard pattern
- **Error states:** Text message matching dashboard pattern + 404 handling for profile pages
- **Toast notifications:** react-hot-toast (already configured in App.tsx)
- **Icons:** lucide-react (already used throughout)
- **Responsive:** Mobile-first, same breakpoints as existing pages
- **Submit buttons:** Disabled with loading text during form submission

## Constraints

- No new npm dependencies
- No backend changes
- No breaking changes to existing pages (except the `CreatorProfile` type fix, which requires updating dashboard field references)
- Reuse existing shared components where possible
- Mock API calls clearly labeled with `// TODO: wire to real endpoint` comments
