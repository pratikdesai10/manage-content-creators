# Frontend Full Buildout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all remaining frontend pages — creator discovery, public profiles, profile editing, settings, email verification, and chat send.

**Architecture:** React SPA with TanStack Query for server state, react-hook-form + Zod for forms, Zustand for auth. New pages follow existing patterns (white bg, Tailwind, lucide-react icons). Client-side filtering for discovery. Mock APIs where backend doesn't exist yet.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, react-hook-form, Zod, Framer Motion, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-18-frontend-full-buildout-design.md`

---

## Chunk 1: Foundation — Types, API, Routes

### Task 1: Update TypeScript types to match backend schema

**Files:**
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: Replace `CreatorProfile` interface**

Replace the existing `CreatorProfile` (10 fields) with the full interface matching the Prisma schema:

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
  categories: string[]
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

- [ ] **Step 2: Replace `SocialAccount` interface**

```typescript
export interface SocialAccount {
  id: string
  creatorProfileId: string
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

- [ ] **Step 3: Update `User` interface**

Remove `updatedAt`, add `isVerified`:

```typescript
export interface User {
  id: string
  email: string
  role: UserRole
  isVerified: boolean
  createdAt: string
}
```

- [ ] **Step 4: Verify build compiles**

Run: `cd frontend && npx tsc --noEmit`

This will likely show errors in `CreatorDashboard.tsx` where `profile.niche` and `profile.location` are used. That's expected — we fix those in Task 2.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "refactor: expand CreatorProfile, SocialAccount, User types to match backend schema"
```

---

### Task 2: Fix CreatorDashboard field references

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorDashboard.tsx`

The `ProfileCard` sub-component (around line 564-627) references `profile.niche` and `profile.location` which no longer exist after Task 1.

- [ ] **Step 1: Replace `profile.niche` with `profile.categories`**

Find (around line 582-589):
```typescript
{profile.niche && profile.niche.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mb-3">
    {profile.niche.map((cat) => (
```

Replace `profile.niche` with `profile.categories` (2 occurrences on those lines).

- [ ] **Step 2: Replace `profile.location` with city/state**

Find (around line 591-596):
```typescript
{profile.location && (
  ...
  <span className="text-xs font-semibold text-gray-800">{profile.location}</span>
```

Replace with:
```typescript
{(profile.city || profile.state) && (
  ...
  <span className="text-xs font-semibold text-gray-800">{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
```

- [ ] **Step 3: Verify build compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors (or only errors unrelated to dashboard).

- [ ] **Step 4: Verify dashboard still works**

Run: `cd frontend && npm run dev` — visit `/dashboard/creator` (if you have a creator account). Profile card should display correctly with categories and city/state.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/dashboard/CreatorDashboard.tsx
git commit -m "fix: update CreatorDashboard to use renamed profile fields (categories, city/state)"
```

---

### Task 3: Add new API endpoint functions

**Files:**
- Modify: `frontend/src/api/endpoints.ts`

- [ ] **Step 1: Add real endpoint functions**

Add these after the existing agency endpoint functions (after line 270):

```typescript
// ── Single Profile Endpoints ─────────────────────────────────────────────────

export async function getCreatorProfile(id: string): Promise<CreatorProfile> {
  const { data } = await apiClient.get<{ data: CreatorProfile }>(`/creators/${id}`);
  return data.data;
}

export async function getAgencyProfile(id: string): Promise<AgencyProfile> {
  const { data } = await apiClient.get<{ data: AgencyProfile }>(`/agencies/${id}`);
  return data.data;
}

export async function updateCreatorProfile(id: string, payload: Record<string, unknown>): Promise<CreatorProfile> {
  const { data } = await apiClient.patch<{ data: CreatorProfile }>(`/creators/${id}`, payload);
  return data.data;
}

export async function updateAgencyProfile(id: string, payload: Record<string, unknown>): Promise<AgencyProfile> {
  const { data } = await apiClient.patch<{ data: AgencyProfile }>(`/agencies/${id}`, payload);
  return data.data;
}
```

- [ ] **Step 2: Add mocked endpoint functions**

```typescript
// ── Mocked Endpoints (no backend yet) ────────────────────────────────────────

export async function changePassword(_data: { currentPassword: string; newPassword: string }): Promise<void> {
  // TODO: wire to real endpoint when backend adds support
  console.log('changePassword called (mocked)', _data);
  await new Promise((r) => setTimeout(r, 500));
}

export async function updateAccountEmail(_data: { newEmail: string }): Promise<void> {
  // TODO: wire to real endpoint when backend adds support
  console.log('updateEmail called (mocked)', _data);
  await new Promise((r) => setTimeout(r, 500));
}

export async function deleteAccount(): Promise<void> {
  // TODO: wire to real endpoint when backend adds support
  console.log('deleteAccount called (mocked)');
  await new Promise((r) => setTimeout(r, 500));
}

export async function resendVerificationEmail(): Promise<void> {
  // TODO: wire to real endpoint when backend adds support
  console.log('resendVerificationEmail called (mocked)');
  await new Promise((r) => setTimeout(r, 500));
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/api/endpoints.ts
git commit -m "feat: add single profile, update profile, and mocked settings endpoint functions"
```

---

### Task 4: Add Zod schemas for edit forms and settings

**Files:**
- Create: `frontend/src/schemas/creatorEditSchema.ts`
- Create: `frontend/src/schemas/agencyEditSchema.ts`
- Create: `frontend/src/schemas/settingsSchema.ts`

- [ ] **Step 1: Create creator edit schema**

```typescript
// frontend/src/schemas/creatorEditSchema.ts
import { z } from 'zod';

export const creatorEditSchema = z.object({
  firstName: z.string().min(2, 'Min 2 characters').max(50),
  lastName: z.string().min(2, 'Min 2 characters').max(50),
  bio: z.string().min(50, 'Min 50 characters').max(500, 'Max 500 characters'),
  profileImageUrl: z.string().optional().or(z.literal('')),
  socialAccounts: z.array(z.object({
    platform: z.string().min(1, 'Select a platform'),
    profileUrl: z.string().url('Must be a valid URL'),
    handle: z.string().min(2).max(50),
    followerCount: z.number({ coerce: true }).min(0),
    accountType: z.string().optional(),
  })).min(1, 'At least one social account is required'),
  categories: z.array(z.string()).min(1, 'Select at least 1').max(3, 'Max 3 categories'),
  languages: z.array(z.string()).min(1, 'Select at least 1 language'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  contentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  rateRange: z.string().min(1, 'Select a rate range'),
  collaborationTypes: z.array(z.string()).min(1, 'Select at least 1'),
  availability: z.string().min(1, 'Select availability'),
  willingToTravel: z.boolean(),
  travelScope: z.string().optional(),
  previousCollaborations: z.preprocess(
    (val) => (val === null || val === undefined || val === '' || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0).optional(),
  ),
  notableBrands: z.array(z.string()),
});

export type CreatorEditFormData = z.infer<typeof creatorEditSchema>;
```

- [ ] **Step 2: Create agency edit schema**

```typescript
// frontend/src/schemas/agencyEditSchema.ts
import { z } from 'zod';

export const agencyEditSchema = z.object({
  // Contact person
  contactPersonName: z.string().min(2).max(100),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(10).max(15).optional().or(z.literal('')),
  designation: z.string().min(2).max(50),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // Brand details
  brandName: z.string().min(2).max(100),
  companyLegalName: z.string().min(2).max(150),
  website: z.string().url('Must be a valid URL'),
  logoUrl: z.string().optional().or(z.literal('')),
  industry: z.string().min(1, 'Select an industry'),
  companySize: z.string().min(1, 'Select company size'),
  yearFounded: z.number({ coerce: true }).min(1900).max(new Date().getFullYear()).optional(),
  gstin: z.string().optional().or(z.literal('')),
  description: z.string().min(50, 'Min 50 characters').max(500),
  brandSocials: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }).optional(),
  // Location
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pinCode: z.string().optional().or(z.literal('')),
  // Target audience
  targetAgeGroups: z.array(z.string()).min(1, 'Select at least 1'),
  targetGenders: z.array(z.string()).min(1, 'Select at least 1'),
  targetLocations: z.array(z.string()).min(1, 'Select at least 1'),
  targetIncomeBracket: z.string().optional(),
  targetLanguages: z.array(z.string()).min(1, 'Select at least 1'),
  // Campaign preferences
  preferredPlatforms: z.array(z.string()).min(1, 'Select at least 1'),
  contentTypesNeeded: z.array(z.string()).min(1, 'Select at least 1'),
  budgetRange: z.string().min(1, 'Select budget range'),
  paymentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  paymentTimeline: z.string().min(1, 'Select payment timeline'),
  campaignsPerMonth: z.string().optional(),
  preferredFollowerRange: z.array(z.string()).min(1, 'Select at least 1'),
  preferredCreatorCategories: z.array(z.string()).min(1, 'Select at least 1').max(5, 'Max 5'),
});

export type AgencyEditFormData = z.infer<typeof agencyEditSchema>;
```

- [ ] **Step 3: Create settings schemas**

```typescript
// frontend/src/schemas/settingsSchema.ts
import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const updateEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;
```

- [ ] **Step 4: Verify build**

Run: `cd frontend && npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/schemas/creatorEditSchema.ts frontend/src/schemas/agencyEditSchema.ts frontend/src/schemas/settingsSchema.ts
git commit -m "feat: add Zod schemas for creator/agency profile edit and settings forms"
```

---

### Task 5: Update App.tsx routes and Navbar

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/Navbar.tsx`

- [ ] **Step 1: Add route imports and new routes to App.tsx**

Add imports at top of `App.tsx`:
```typescript
import { CreatorDiscovery } from "./pages/creators/CreatorDiscovery"
import { CreatorPublicProfile } from "./pages/creators/CreatorPublicProfile"
import { AgencyPublicProfile } from "./pages/agencies/AgencyPublicProfile"
import { CreatorEditProfile } from "./pages/dashboard/CreatorEditProfile"
import { AgencyEditProfile } from "./pages/dashboard/AgencyEditProfile"
import { Settings } from "./pages/Settings"
```

Replace the routes block (lines 31-56) with:
```typescript
<Route element={<PageLayout />}>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup/creator" element={<CreatorSignup />} />
  <Route path="/signup/agency" element={<AgencySignup />} />
  <Route path="/signup/verify-email" element={<EmailVerification />} />

  {/* Protected — any authenticated role */}
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

- [ ] **Step 2: Add "Discover" nav link to Navbar.tsx**

In `Navbar.tsx`, find the authenticated user nav links section (around line 52-56). Add a "Discover" link before the "Dashboard" link:

```typescript
{isAuthenticated && user ? (
  <>
    <Link to="/creators" className={`text-sm ${isLanding ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
      Discover
    </Link>
    <Link to={dashboardPath} className={`text-sm ${isLanding ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
      Dashboard
    </Link>
```

- [ ] **Step 3: Add Settings link to dropdown menu**

In the dropdown menu, add a Settings link between "View Profile" and the divider:

```typescript
<Link
  to="/settings"
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
>
  <span className="text-base">⚙️</span> Settings
</Link>
```

- [ ] **Step 4: Create stub pages so routes don't break**

Create minimal stub files so the app compiles. These will be fully implemented in later tasks.

Create `frontend/src/pages/creators/CreatorDiscovery.tsx`:
```typescript
export function CreatorDiscovery() {
  return <div className="max-w-7xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Discover Creators</h1></div>;
}
```

Create `frontend/src/pages/creators/CreatorPublicProfile.tsx`:
```typescript
export function CreatorPublicProfile() {
  return <div className="max-w-7xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Creator Profile</h1></div>;
}
```

Create `frontend/src/pages/agencies/AgencyPublicProfile.tsx`:
```typescript
export function AgencyPublicProfile() {
  return <div className="max-w-7xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Agency Profile</h1></div>;
}
```

Create `frontend/src/pages/dashboard/CreatorEditProfile.tsx`:
```typescript
export function CreatorEditProfile() {
  return <div className="max-w-7xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Edit Creator Profile</h1></div>;
}
```

Create `frontend/src/pages/dashboard/AgencyEditProfile.tsx`:
```typescript
export function AgencyEditProfile() {
  return <div className="max-w-7xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Edit Agency Profile</h1></div>;
}
```

Create `frontend/src/pages/Settings.tsx`:
```typescript
export function Settings() {
  return <div className="max-w-7xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Settings</h1></div>;
}
```

- [ ] **Step 5: Verify build and routes**

Run: `cd frontend && npm run build`
Expected: Build succeeds. Then `npm run dev` — verify that navigating to `/creators`, `/settings` shows the stub pages. Verify "Discover" link appears in navbar when logged in.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/layout/Navbar.tsx \
  frontend/src/pages/creators/ frontend/src/pages/agencies/ \
  frontend/src/pages/dashboard/CreatorEditProfile.tsx \
  frontend/src/pages/dashboard/AgencyEditProfile.tsx \
  frontend/src/pages/Settings.tsx
git commit -m "feat: add route structure, nav links, and stub pages for all new frontend pages"
```

---

## Chunk 2: Creator Discovery Page

### Task 6: Build Creator Discovery page

**Files:**
- Modify: `frontend/src/pages/creators/CreatorDiscovery.tsx` (replace stub)

This is the largest single page. It has a search bar, collapsible filter panel, and a responsive grid of creator cards.

- [ ] **Step 1: Implement the full CreatorDiscovery component**

Replace the stub with the full implementation. Key structure:

```typescript
// frontend/src/pages/creators/CreatorDiscovery.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { getCreatorProfiles } from '../../api/endpoints';
import type { CreatorProfile } from '../../types';
import { CREATOR_CATEGORIES, CATEGORY_LABELS, SOCIAL_PLATFORMS, PLATFORM_LABELS,
  RATE_RANGES, RATE_RANGE_LABELS, AVAILABILITY_OPTIONS, AVAILABILITY_LABELS } from '../../types/creator.types';
import { FOLLOWER_RANGES } from '../../types/agency.types';
```

**State shape:**
```typescript
interface Filters {
  search: string;
  categories: string[];
  platforms: string[];
  rateRange: string;
  availability: string;
  followerRange: string;
  city: string;
  state: string;
}
const emptyFilters: Filters = { search: '', categories: [], platforms: [], rateRange: '', availability: '', followerRange: '', city: '', state: '' };
```

**Filter logic:**
```typescript
function applyFilters(creators: CreatorProfile[], filters: Filters): CreatorProfile[] {
  return creators.filter((c) => {
    if (filters.search && !c.displayName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.categories.length && !filters.categories.some((cat) => c.categories.includes(cat))) return false;
    if (filters.platforms.length && !filters.platforms.some((p) => c.socialAccounts.some((s) => s.platform === p))) return false;
    if (filters.rateRange && c.rateRange !== filters.rateRange) return false;
    if (filters.availability && c.availability !== filters.availability) return false;
    if (filters.city && !c.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.state && !c.state.toLowerCase().includes(filters.state.toLowerCase())) return false;
    if (filters.followerRange) {
      const ranges: Record<string, [number, number]> = {
        NANO: [1000, 10000], MICRO: [10000, 50000], MID_TIER: [50000, 500000],
        MACRO: [500000, 1000000], MEGA: [1000000, Infinity],
      };
      const [min, max] = ranges[filters.followerRange] || [0, Infinity];
      const maxFollowers = Math.max(0, ...c.socialAccounts.map((s) => s.followerCount));
      if (maxFollowers < min || maxFollowers >= max) return false;
    }
    return true;
  });
}
```

**Active filter count:**
```typescript
const activeFilterCount = useMemo(() => {
  let count = 0;
  if (filters.categories.length) count++;
  if (filters.platforms.length) count++;
  if (filters.rateRange) count++;
  if (filters.availability) count++;
  if (filters.followerRange) count++;
  if (filters.city) count++;
  if (filters.state) count++;
  return count;
}, [filters]);
```

**Layout structure:**
- Page header: "Discover Creators" + subtitle
- Search bar row: text input with search icon + filter toggle button (shows active count badge)
- Collapsible filter panel (`showFilters` state): grid of filter controls + clear button
- Results grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Each card: `<Link to={/creators/${c.id}}>` wrapping a card with avatar, name, category, location, platform, rate, availability
- Loading state: "Loading creators..." centered
- Error state: "Failed to load creators" with message
- Empty state: "No creators match your filters" with clear filters button

**Creator card helper — format followers:**
```typescript
function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
```

**Creator card helper — get primary platform:**
```typescript
function getPrimaryPlatform(accounts: CreatorProfile['socialAccounts']) {
  if (!accounts.length) return null;
  return accounts.reduce((best, a) => a.followerCount > best.followerCount ? a : best);
}
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Manual test**

Run: `cd frontend && npm run dev` — log in, navigate to `/creators`. Verify:
- Page loads and fetches creators from API
- Search filters by display name
- Filter panel toggles open/close
- Category/platform chips toggle selection
- Creator cards display correctly and link to `/creators/:id`
- Empty state shows when filters match nothing

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/creators/CreatorDiscovery.tsx
git commit -m "feat: implement creator discovery page with search and advanced filters"
```

---

## Chunk 3: Public Profile Pages

### Task 7: Build Creator Public Profile page

**Files:**
- Modify: `frontend/src/pages/creators/CreatorPublicProfile.tsx` (replace stub)

- [ ] **Step 1: Implement CreatorPublicProfile**

Key structure:
```typescript
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, MapPin, Clock, DollarSign, Globe } from 'lucide-react';
import { getCreatorProfile } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORY_LABELS, PLATFORM_LABELS, RATE_RANGE_LABELS, AVAILABILITY_LABELS,
  COLLABORATION_TYPE_LABELS, TRAVEL_SCOPE_LABELS, CONTENT_TYPE_LABELS } from '../../types/creator.types';
```

Use `useParams<{ id: string }>()` to get the profile ID.

Fetch: `useQuery({ queryKey: ['creator', id], queryFn: () => getCreatorProfile(id!) })`

**Sections:**
1. **Back button** → `/creators`
2. **Hero**: avatar (profileImageUrl or initials gradient circle), display name, first/last name, bio, location badges, availability badge, rate range badge
3. **Social Accounts**: grid of cards — platform icon/name, @handle, follower count, engagement rate %
4. **Categories & Content Types**: tag chips using labels maps
5. **Collaboration**: collaboration type chips, travel willingness text, notable brands as chips
6. **Portfolio**: external link button if `portfolioUrl` exists
7. **Own profile**: if `profile.userId === user?.id`, show "Edit Profile" button linking to `/dashboard/creator/edit-profile`

**States:**
- Loading: centered "Loading profile..."
- Error/404: "Creator not found" + back button
- Data: full profile layout

- [ ] **Step 2: Verify build**

Run: `cd frontend && npm run build`

- [ ] **Step 3: Manual test**

Navigate to `/creators/:id` for a creator. Verify all sections display. Verify own profile shows edit button.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/creators/CreatorPublicProfile.tsx
git commit -m "feat: implement creator public profile page"
```

---

### Task 8: Build Agency Public Profile page

**Files:**
- Modify: `frontend/src/pages/agencies/AgencyPublicProfile.tsx` (replace stub)

- [ ] **Step 1: Implement AgencyPublicProfile**

Same pattern as creator profile. Use `useParams<{ id: string }>()`, fetch via `getAgencyProfile(id!)`.

Import label maps from `agency.types.ts`: `INDUSTRY_LABELS`, `COMPANY_SIZE_LABELS`, `BUDGET_RANGE_LABELS`, `PAYMENT_TYPE_LABELS`, `PAYMENT_TIMELINE_LABELS`, `FOLLOWER_RANGE_LABELS`.

**Sections:**
1. **Back button** → `/` (home, since there's no agency browse page)
2. **Hero**: logo or initials, brand name, industry tag, company size tag, year founded, website external link
3. **Description**: full description text
4. **Contact**: person name, designation, email (from `profile.contact`)
5. **Target Audience**: age groups, genders, locations, income bracket, languages (from `profile.targetAudience`)
6. **Campaign Preferences**: preferred platforms, content types, budget range, payment types/timeline, follower ranges, creator categories (from `profile.campaignPreferences`)
7. **Brand Socials**: list of social links (from `profile.brandSocials`)
8. **Own profile**: if `profile.userId === user?.id`, show "Edit Profile" button → `/dashboard/agency/edit-profile`

**States:** Loading, error/404, data — same pattern as creator profile.

- [ ] **Step 2: Verify build and test**

Run: `cd frontend && npm run build`
Navigate to `/agencies/:id` — verify profile displays correctly.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/agencies/AgencyPublicProfile.tsx
git commit -m "feat: implement agency public profile page"
```

---

## Chunk 4: Profile Edit Pages

### Task 9: Build Creator Edit Profile page

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorEditProfile.tsx` (replace stub)

- [ ] **Step 1: Implement CreatorEditProfile**

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getCreatorProfiles, updateCreatorProfile } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { creatorEditSchema, type CreatorEditFormData } from '../../schemas/creatorEditSchema';
import { CREATOR_CATEGORIES, CATEGORY_LABELS, RATE_RANGES, RATE_RANGE_LABELS,
  AVAILABILITY_OPTIONS, AVAILABILITY_LABELS, COLLABORATION_TYPES, COLLABORATION_TYPE_LABELS,
  TRAVEL_SCOPES, TRAVEL_SCOPE_LABELS, CONTENT_TYPES, CONTENT_TYPE_LABELS,
  LANGUAGES, SOCIAL_PLATFORMS } from '../../types/creator.types';
```

**Data flow:**
1. Fetch all creators → find current user's profile by `profile.userId === user.id`
2. `useEffect` → when profile loads, call `form.reset(mapProfileToForm(profile))` to pre-fill
3. `useFieldArray` for `socialAccounts`
4. On submit: `useMutation` calling `updateCreatorProfile(profile.id, payload)`
5. `onSuccess`: invalidate `['creators']` and `['creator', profileId]`, toast, navigate to dashboard

**Map profile to form data:**
```typescript
function mapProfileToForm(p: CreatorProfile): CreatorEditFormData {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    bio: p.bio,
    profileImageUrl: p.profileImageUrl || '',
    socialAccounts: p.socialAccounts.map((s) => ({
      platform: s.platform,
      profileUrl: s.profileUrl || '',
      handle: s.handle,
      followerCount: s.followerCount,
      accountType: s.accountType || '',
    })),
    categories: p.categories,
    languages: p.languages,
    city: p.city,
    state: p.state,
    country: p.country,
    contentTypes: p.contentTypes,
    portfolioUrl: p.portfolioUrl || '',
    rateRange: p.rateRange,
    collaborationTypes: p.collaborationTypes,
    availability: p.availability,
    willingToTravel: p.willingToTravel,
    travelScope: p.travelScope || '',
    previousCollaborations: p.previousCollaborations ?? undefined,
    notableBrands: p.notableBrands,
  };
}
```

**Layout:** Single scrollable form with 4 sections separated by headings and dividers. Each section uses the same shared form components as the signup steps (CategorySelector, ChipMultiSelect, SocialAccountEntry, ImageUpload). Top of page: heading + Cancel button. Bottom: Save Changes button (disabled while submitting, shows "Saving...").

**Reuse shared signup components by importing from:**
- `../../pages/signup/components/shared/CategorySelector`
- `../../pages/signup/components/shared/ChipMultiSelect`
- `../../pages/signup/components/shared/SocialAccountEntry`
- `../../pages/signup/components/shared/ImageUpload`

- [ ] **Step 2: Verify build**

Run: `cd frontend && npm run build`

- [ ] **Step 3: Manual test**

Log in as creator, navigate to `/dashboard/creator/edit-profile`. Verify:
- Form pre-fills with current profile data
- All fields are editable (except displayName which is disabled)
- Social accounts can be added/removed
- Submit updates profile and navigates to dashboard
- Cancel navigates back to dashboard

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboard/CreatorEditProfile.tsx
git commit -m "feat: implement creator profile edit page with pre-filled form"
```

---

### Task 10: Build Agency Edit Profile page

**Files:**
- Modify: `frontend/src/pages/dashboard/AgencyEditProfile.tsx` (replace stub)

- [ ] **Step 1: Implement AgencyEditProfile**

Same pattern as creator edit. Key differences:
- Fetch agency profiles → find by `userId`
- Form uses `agencyEditSchema`
- Pre-fill maps agency profile fields to form data (including nested `contact`, `targetAudience`, `campaignPreferences`)
- Submit transforms form data back to backend shape (nest `targetAudience` and `campaignPreferences`, same as signup `registerAgency` endpoint)
- Calls `updateAgencyProfile(profile.id, payload)`
- Invalidates `['agencies']` and `['agency', profileId]`

**Map profile to form:**
```typescript
function mapProfileToForm(p: AgencyProfile): AgencyEditFormData {
  return {
    contactPersonName: p.contact?.contactPersonName || '',
    contactEmail: p.contact?.contactEmail || '',
    contactPhone: p.contact?.contactPhone || '',
    designation: p.contact?.designation || '',
    linkedinUrl: p.contact?.linkedinUrl || '',
    brandName: p.brandName,
    companyLegalName: p.companyLegalName,
    website: p.website,
    logoUrl: p.logoUrl || '',
    industry: p.industry,
    companySize: p.companySize,
    yearFounded: p.yearFounded ?? undefined,
    gstin: p.gstin || '',
    description: p.description,
    brandSocials: {
      instagram: (p.brandSocials as Record<string,string>)?.instagram || '',
      youtube: (p.brandSocials as Record<string,string>)?.youtube || '',
      twitter: (p.brandSocials as Record<string,string>)?.twitter || '',
      facebook: (p.brandSocials as Record<string,string>)?.facebook || '',
      linkedin: (p.brandSocials as Record<string,string>)?.linkedin || '',
    },
    city: p.city,
    state: p.state,
    country: p.country,
    pinCode: p.pinCode || '',
    targetAgeGroups: p.targetAudience?.ageGroups || [],
    targetGenders: p.targetAudience?.genders || [],
    targetLocations: p.targetAudience?.locations || [],
    targetIncomeBracket: p.targetAudience?.incomeBracket || '',
    targetLanguages: p.targetAudience?.languages || [],
    preferredPlatforms: p.campaignPreferences?.platforms || [],
    contentTypesNeeded: p.campaignPreferences?.contentTypes || [],
    budgetRange: p.campaignPreferences?.budgetRange || '',
    paymentTypes: p.campaignPreferences?.paymentTypes || [],
    paymentTimeline: p.campaignPreferences?.paymentTimeline || '',
    campaignsPerMonth: p.campaignPreferences?.campaignsPerMonth || '',
    preferredFollowerRange: p.campaignPreferences?.preferredFollowerRange || [],
    preferredCreatorCategories: p.campaignPreferences?.preferredCreatorCategories || [],
  };
}
```

**Submit transformation (same as registerAgency):**
```typescript
function buildPayload(data: AgencyEditFormData) {
  return {
    brandName: data.brandName,
    companyLegalName: data.companyLegalName,
    website: data.website,
    logoUrl: data.logoUrl || undefined,
    industry: data.industry,
    companySize: data.companySize,
    yearFounded: data.yearFounded || undefined,
    gstin: data.gstin || undefined,
    description: data.description,
    brandSocials: data.brandSocials,
    city: data.city,
    state: data.state,
    country: data.country,
    pinCode: data.pinCode || undefined,
    contact: {
      contactPersonName: data.contactPersonName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || undefined,
      designation: data.designation,
      linkedinUrl: data.linkedinUrl || undefined,
    },
    targetAudience: {
      ageGroups: data.targetAgeGroups,
      genders: data.targetGenders,
      locations: data.targetLocations,
      incomeBracket: data.targetIncomeBracket || undefined,
      languages: data.targetLanguages,
    },
    campaignPreferences: {
      platforms: data.preferredPlatforms,
      contentTypes: data.contentTypesNeeded,
      budgetRange: data.budgetRange,
      paymentTypes: data.paymentTypes,
      paymentTimeline: data.paymentTimeline,
      campaignsPerMonth: data.campaignsPerMonth || undefined,
      preferredFollowerRange: data.preferredFollowerRange,
      preferredCreatorCategories: data.preferredCreatorCategories,
    },
  };
}
```

- [ ] **Step 2: Verify build and test**

Run: `cd frontend && npm run build`
Log in as agency, test edit form pre-fill and submit.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/dashboard/AgencyEditProfile.tsx
git commit -m "feat: implement agency profile edit page with pre-filled form"
```

---

### Task 11: Wire Edit Profile buttons in dashboards

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorDashboard.tsx`
- Modify: `frontend/src/pages/dashboard/AgencyDashboard.tsx`

- [ ] **Step 1: Update CreatorDashboard ProfileCard "Edit Profile" button**

Find the "Edit Profile" button in the ProfileCard sub-component (around line 622-624). It currently does nothing. Add `Link` import (already imported) and change the button to:

```typescript
<Link
  to="/dashboard/creator/edit-profile"
  className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition text-center block"
>
  Edit Profile
</Link>
```

- [ ] **Step 2: Update AgencyDashboard ProfileCard "Edit Profile" button**

Same change in AgencyDashboard's AgencyProfileCard (around line 645-647):

```typescript
<Link
  to="/dashboard/agency/edit-profile"
  className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition text-center block"
>
  Edit Profile
</Link>
```

- [ ] **Step 3: Verify and commit**

Run: `cd frontend && npm run build`
Verify clicking "Edit Profile" on both dashboards navigates to the correct edit page.

```bash
git add frontend/src/pages/dashboard/CreatorDashboard.tsx frontend/src/pages/dashboard/AgencyDashboard.tsx
git commit -m "feat: wire Edit Profile buttons to edit profile pages in both dashboards"
```

---

## Chunk 5: Settings, Email Verification, Chat Send

### Task 12: Build Settings page

**Files:**
- Modify: `frontend/src/pages/Settings.tsx` (replace stub)

- [ ] **Step 1: Implement Settings page**

Three sections: Change Password, Update Email, Delete Account.

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Shield, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { changePassword, updateAccountEmail, deleteAccount } from '../api/endpoints';
import { changePasswordSchema, updateEmailSchema, type ChangePasswordFormData, type UpdateEmailFormData } from '../schemas/settingsSchema';
```

**Change Password section:**
- Form with `currentPassword`, `newPassword` (with PasswordStrengthMeter — import from `./signup/components/shared/PasswordStrengthMeter`), `confirmNewPassword`
- Submit: call `changePassword()` mock → toast "Password changed successfully" → reset form

**Update Email section:**
- Show current email (read-only `<p>`)
- Form with `newEmail` input
- Submit: call `updateAccountEmail()` mock → toast "Verification email sent to new address" → reset form

**Delete Account section:**
- Red border card with warning text
- "Delete Account" button → opens inline confirmation:
  - Text: "Type DELETE to confirm"
  - Input field + Cancel and Confirm buttons
  - Confirm disabled until input === "DELETE"
  - Submit: call `deleteAccount()` mock → `logout()` → navigate to `/`

Each section has its own form and submit handler. Use `isSubmitting` from form state to disable buttons.

- [ ] **Step 2: Verify build and test**

Run: `cd frontend && npm run build`
Navigate to `/settings`. Test all three forms — verify toasts appear and delete logs out.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings.tsx
git commit -m "feat: implement account settings page (password, email, delete — mocked APIs)"
```

---

### Task 13: Wire Email Verification resend button

**Files:**
- Modify: `frontend/src/pages/signup/EmailVerification.tsx`

- [ ] **Step 1: Wire the resend handler**

Import: `import { resendVerificationEmail } from '../../api/endpoints';`
Import: `import toast from 'react-hot-toast';`

Replace the `handleResend` function:
```typescript
const handleResend = async () => {
  setCountdown(60);
  setCanResend(false);
  try {
    await resendVerificationEmail();
    toast.success('Verification email resent!');
  } catch {
    toast.error('Failed to resend email. Please try again.');
  }
};
```

- [ ] **Step 2: Verify build and test**

Run: `cd frontend && npm run build`
Navigate to `/signup/verify-email`. Wait for countdown, click Resend — verify toast appears and countdown resets.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/signup/EmailVerification.tsx
git commit -m "feat: wire email verification resend button with mocked API"
```

---

### Task 14: Wire dashboard chat send buttons

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorDashboard.tsx`
- Modify: `frontend/src/pages/dashboard/AgencyDashboard.tsx`

- [ ] **Step 1: Update ChatPanel in CreatorDashboard**

Find the ChatPanel sub-component (around line 254-344). Currently, the send handler clears the draft but doesn't append the message. Update the send logic:

Find the send handler (the function that clears draft on Enter/button click). Replace with:

```typescript
const handleSend = () => {
  if (!draft.trim()) return;
  const newMessage: MessageThreadEntry = {
    id: `local-${Date.now()}`,
    sender: 'CREATOR',
    text: draft.trim(),
    sentAt: new Date().toISOString(),
  };
  // Append to local thread (ephemeral — disappears on refetch/navigation)
  if (threadData) {
    threadData.threads = [...threadData.threads, newMessage];
  }
  setDraft('');
  toast.success('Message sent');
  // Auto-scroll to bottom
  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
};
```

Note: `MessageThreadEntry` type is already imported from endpoints.ts. `toast` needs to be imported: `import toast from 'react-hot-toast';` (add at top if not already imported). `threadData` is the result of `useQuery` — mutating it directly is an optimistic local update.

- [ ] **Step 2: Update AgencyChatPanel in AgencyDashboard**

Same change in AgencyDashboard's AgencyChatPanel, but with `sender: 'BRAND'` instead of `'CREATOR'`.

- [ ] **Step 3: Verify build and test**

Run: `cd frontend && npm run build`
Open chat widget on both dashboards. Type a message and send — verify:
- Message appears in thread (creator messages on right, brand on left)
- Input clears
- Toast shows "Message sent"
- Auto-scrolls to bottom

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboard/CreatorDashboard.tsx frontend/src/pages/dashboard/AgencyDashboard.tsx
git commit -m "feat: wire chat send buttons with local message append (ephemeral)"
```

---

## Chunk 6: Final Verification and Documentation

### Task 15: Full build verification

- [ ] **Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify all routes work**

Run: `cd frontend && npm run dev`

Test each route:
1. `/` — Landing page (dark theme, all sections)
2. `/login` — Login form
3. `/signup/creator` — Creator signup (5 steps)
4. `/signup/agency` — Agency signup (5 steps)
5. `/signup/verify-email` — Verification page, resend works
6. `/creators` — Discovery page with search/filters
7. `/creators/:id` — Creator public profile (use an ID from discovery page)
8. `/agencies/:id` — Agency public profile (if you have an agency profile ID)
9. `/dashboard/creator` — Creator dashboard (edit profile button works)
10. `/dashboard/creator/edit-profile` — Edit form (pre-filled, submits)
11. `/dashboard/agency` — Agency dashboard (edit profile button works)
12. `/dashboard/agency/edit-profile` — Edit form (pre-filled, submits)
13. `/settings` — Settings page (all three sections work)
14. `/nonexistent` — 404 page

Verify navbar:
- Unauthenticated: Home, Login, Sign Up
- Authenticated: Discover, Dashboard, avatar dropdown (Dashboard, Profile, Settings, Logout)

- [ ] **Step 3: Verify no regressions**

Specifically check:
- Landing page animations still work
- Dashboard stat cards / sparklines still render
- Dashboard detail panels still open/close
- Login → dashboard redirect works
- Signup → verify-email redirect works

### Task 16: Update module documentation

**Files:**
- Modify: `frontend/src/pages/claude.md`
- Modify: `frontend/src/types/claude.md`
- Modify: `frontend/src/api/claude.md`

- [ ] **Step 1: Update pages/claude.md**

Add entries for:
- `creators/CreatorDiscovery.tsx` — Browse/search with advanced filters
- `creators/CreatorPublicProfile.tsx` — Read-only creator profile view
- `agencies/AgencyPublicProfile.tsx` — Read-only agency profile view
- `dashboard/CreatorEditProfile.tsx` — Creator profile edit form
- `dashboard/AgencyEditProfile.tsx` — Agency profile edit form
- `Settings.tsx` — Account settings (password, email, delete)

- [ ] **Step 2: Update types/claude.md**

Document the expanded `CreatorProfile`, `SocialAccount`, and `User` interfaces.

- [ ] **Step 3: Update api/claude.md**

Add entries for new endpoint functions: `getCreatorProfile`, `getAgencyProfile`, `updateCreatorProfile`, `updateAgencyProfile`, `changePassword`, `updateAccountEmail`, `deleteAccount`, `resendVerificationEmail`.

- [ ] **Step 4: Commit all docs**

```bash
git add frontend/src/pages/claude.md frontend/src/types/claude.md frontend/src/api/claude.md
git commit -m "docs: update module documentation for new pages, types, and endpoints"
```
