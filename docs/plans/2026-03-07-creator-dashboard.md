# Creator Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a split-layout creator dashboard with a profile sidebar, stat cards (profile views, collaborations, messages), social account bar chart, and recent collaboration/message lists — backed by two new mock Prisma models.

**Architecture:** Add `Collaboration` and `Message` models to Prisma, seed them with mock data, expose 3 new endpoints on the existing `CreatorController`, then build the React dashboard UI consuming those APIs via TanStack Query.

**Tech Stack:** NestJS, Prisma, PostgreSQL, React 18, TanStack Query, Tailwind CSS, Zustand

---

## Phase 1: Backend — Schema + Seed

### Task 1: Add Collaboration and Message models to Prisma schema

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Add the two models at the end of `schema.prisma`**

```prisma
model Collaboration {
  id         String            @id @default(uuid())
  creatorId  String
  creator    CreatorProfile    @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  brandName  String
  brandLogo  String?
  type       CollaborationType
  status     String
  createdAt  DateTime          @default(now())
}

model Message {
  id        String         @id @default(uuid())
  creatorId String
  creator   CreatorProfile @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  brandName String
  preview   String
  isRead    Boolean        @default(false)
  createdAt DateTime       @default(now())
}
```

Also add the back-relations on `CreatorProfile` model (inside the existing model block):

```prisma
  collaborations Collaboration[]
  messages       Message[]
```

**Step 2: Run migration**

```bash
cd backend
npm run db:migrate
# When prompted for migration name, enter: add_collaboration_message_models
```

Expected: Migration applied, Prisma client regenerated.

**Step 3: Verify Prisma client has new types**

```bash
cd backend
npm run db:generate
```

Expected: No errors, `@prisma/client` updated.

**Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add Collaboration and Message models to schema"
```

---

### Task 2: Write seed script with mock data

**Files:**
- Create: `backend/prisma/seed.ts`
- Modify: `backend/package.json` (add prisma.seed config)

**Step 1: Create `backend/prisma/seed.ts`**

```ts
import { PrismaClient, CollaborationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the first creator profile to seed data for
  const creators = await prisma.creatorProfile.findMany({ take: 3 });

  if (creators.length === 0) {
    console.log('No creator profiles found. Register a creator first, then re-run seed.');
    return;
  }

  for (const creator of creators) {
    // Clear existing mock data
    await prisma.collaboration.deleteMany({ where: { creatorId: creator.id } });
    await prisma.message.deleteMany({ where: { creatorId: creator.id } });

    // Seed collaborations
    await prisma.collaboration.createMany({
      data: [
        {
          creatorId: creator.id,
          brandName: 'Zomato',
          brandLogo: null,
          type: CollaborationType.PAID_CAMPAIGNS,
          status: 'COMPLETED',
          createdAt: new Date('2026-02-01'),
        },
        {
          creatorId: creator.id,
          brandName: 'Boat',
          brandLogo: null,
          type: CollaborationType.BRAND_AMBASSADOR,
          status: 'ACTIVE',
          createdAt: new Date('2026-02-15'),
        },
        {
          creatorId: creator.id,
          brandName: 'Mamaearth',
          brandLogo: null,
          type: CollaborationType.PRODUCT_EXCHANGE,
          status: 'COMPLETED',
          createdAt: new Date('2026-01-20'),
        },
      ],
    });

    // Seed messages
    await prisma.message.createMany({
      data: [
        {
          creatorId: creator.id,
          brandName: 'Nike India',
          preview: 'Hi! We loved your recent reel and would love to discuss a campaign...',
          isRead: false,
          createdAt: new Date('2026-03-06'),
        },
        {
          creatorId: creator.id,
          brandName: 'Nykaa',
          preview: "We're launching a new skincare line and think you'd be a great fit...",
          isRead: true,
          createdAt: new Date('2026-03-04'),
        },
        {
          creatorId: creator.id,
          brandName: 'Lenskart',
          preview: 'Partnership opportunity for our upcoming summer collection...',
          isRead: false,
          createdAt: new Date('2026-03-01'),
        },
      ],
    });

    console.log(`Seeded data for creator: ${creator.displayName}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Add seed config to `backend/package.json`**

Find the `"prisma"` key (or add it) in `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

**Step 3: Run the seed**

```bash
cd backend
npm run db:seed
```

Expected output:
```
Seeded data for creator: testuser123
```

**Step 4: Commit**

```bash
git add backend/prisma/seed.ts backend/package.json
git commit -m "feat: add mock seed data for collaborations and messages"
```

---

## Phase 2: Backend — API Endpoints

### Task 3: Add dashboard stats and list endpoints to CreatorService

**Files:**
- Modify: `backend/src/creator/creator.service.ts`

**Step 1: Add three new methods to `CreatorService`**

Add after the existing `update()` method:

```ts
async getDashboardStats(creatorId: string) {
  const [collaborationCount, messageCount] = await Promise.all([
    this.prisma.collaboration.count({ where: { creatorId } }),
    this.prisma.message.count({ where: { creatorId } }),
  ]);

  return {
    profileViews: 1284, // mock static value — no tracking model yet
    collaborationCount,
    messageCount,
  };
}

async getRecentCollaborations(creatorId: string) {
  return this.prisma.collaboration.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
}

async getRecentMessages(creatorId: string) {
  return this.prisma.message.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
}
```

**Step 2: Commit**

```bash
git add backend/src/creator/creator.service.ts
git commit -m "feat: add getDashboardStats, getRecentCollaborations, getRecentMessages to CreatorService"
```

---

### Task 4: Add dashboard endpoints to CreatorController

**Files:**
- Modify: `backend/src/creator/creator.controller.ts`

**Step 1: Add three new GET routes after the existing `findOne` route**

```ts
@UseGuards(JwtAuthGuard, CreatorGuard)
@Get(':id/stats')
getStats(@Param('id') id: string) {
  return this.creatorService.getDashboardStats(id);
}

@UseGuards(JwtAuthGuard, CreatorGuard)
@Get(':id/collaborations')
getCollaborations(@Param('id') id: string) {
  return this.creatorService.getRecentCollaborations(id);
}

@UseGuards(JwtAuthGuard, CreatorGuard)
@Get(':id/messages')
getMessages(@Param('id') id: string) {
  return this.creatorService.getRecentMessages(id);
}
```

**Step 2: Verify endpoints work**

Start backend if not running: `cd backend && npm run start:dev`

```bash
# Get a creator ID and token first (login as test creator)
TOKEN="<paste access_token from login response>"
CREATOR_ID="<paste creatorProfile id>"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/creators/$CREATOR_ID/stats
```

Expected response:
```json
{
  "success": true,
  "data": { "profileViews": 1284, "collaborationCount": 3, "messageCount": 3 }
}
```

**Step 3: Commit**

```bash
git add backend/src/creator/creator.controller.ts
git commit -m "feat: add dashboard stats, collaborations, messages endpoints to CreatorController"
```

---

### Task 5: Add frontend API endpoint functions

**Files:**
- Modify: `frontend/src/api/endpoints.ts`

**Step 1: Add types and endpoint functions**

Add at the bottom of `frontend/src/api/endpoints.ts`:

```ts
export interface DashboardStats {
  profileViews: number;
  collaborationCount: number;
  messageCount: number;
}

export interface Collaboration {
  id: string;
  brandName: string;
  brandLogo: string | null;
  type: string;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  brandName: string;
  preview: string;
  isRead: boolean;
  createdAt: string;
}

export async function getCreatorStats(creatorId: string): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ data: DashboardStats }>(`/creators/${creatorId}/stats`);
  return data.data;
}

export async function getRecentCollaborations(creatorId: string): Promise<Collaboration[]> {
  const { data } = await apiClient.get<{ data: Collaboration[] }>(`/creators/${creatorId}/collaborations`);
  return data.data;
}

export async function getRecentMessages(creatorId: string): Promise<Message[]> {
  const { data } = await apiClient.get<{ data: Message[] }>(`/creators/${creatorId}/messages`);
  return data.data;
}
```

**Step 2: Commit**

```bash
git add frontend/src/api/endpoints.ts
git commit -m "feat: add dashboard API endpoint functions to frontend"
```

---

## Phase 3: Frontend — Dashboard UI

### Task 6: Add creatorProfile to auth store

The dashboard needs the creator's profile ID to fetch stats. Currently the auth store only holds `User` (id, email, role). We need to fetch and cache the creator profile after login.

**Files:**
- Modify: `frontend/src/api/endpoints.ts`
- Modify: `frontend/src/stores/authStore.ts`
- Modify: `frontend/src/types/index.ts`

**Step 1: Add `getMyCreatorProfile` endpoint to `endpoints.ts`**

```ts
export async function getMyCreatorProfile(): Promise<CreatorProfile> {
  // GET /creators returns all — find own by userId match via /auth/me pattern
  // Backend GET /creators/:id requires the profile id, not user id.
  // Use findAll and filter, or call /creators and match by userId.
  const { data } = await apiClient.get<{ data: CreatorProfile[] }>('/creators');
  // We'll match in the hook/component using user.id
  return data.data as unknown as CreatorProfile;
}
```

Actually, since backend's `GET /creators/:id` uses profile ID (not user ID), and `GET /creators` returns all profiles including `user.id`, we'll fetch all and filter client-side in the dashboard. No store change needed.

**Step 1 (revised): Add `getCreatorProfiles` to `endpoints.ts`**

```ts
export async function getCreatorProfiles(): Promise<CreatorProfile[]> {
  const { data } = await apiClient.get<{ data: CreatorProfile[] }>('/creators');
  return data.data;
}
```

Add `CreatorProfile` import if not already imported — it's defined in `frontend/src/types/index.ts`.

**Step 2: Commit**

```bash
git add frontend/src/api/endpoints.ts
git commit -m "feat: add getCreatorProfiles endpoint"
```

---

### Task 7: Build the CreatorDashboard page

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorDashboard.tsx`

**Step 1: Replace the placeholder with the full dashboard**

```tsx
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import {
  getCreatorProfiles,
  getCreatorStats,
  getRecentCollaborations,
  getRecentMessages,
} from '../../api/endpoints';

// ── helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  YOUTUBE: '#FF0000',
  TWITTER: '#1DA1F2',
  FACEBOOK: '#1877F2',
  TIKTOK: '#000000',
  LINKEDIN: '#0A66C2',
  BLOG: '#F97316',
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const AVAILABILITY_LABEL: Record<string, { label: string; color: string }> = {
  IMMEDIATELY: { label: 'Available Now', color: 'bg-green-100 text-green-700' },
  ONE_TWO_WEEKS: { label: 'In 1-2 Weeks', color: 'bg-yellow-100 text-yellow-700' },
  ONE_MONTH: { label: 'In 1 Month', color: 'bg-orange-100 text-orange-700' },
  NOT_AVAILABLE: { label: 'Not Available', color: 'bg-red-100 text-red-700' },
};

const RATE_LABEL: Record<string, string> = {
  RATE_1K_5K: '₹1K – ₹5K',
  RATE_5K_20K: '₹5K – ₹20K',
  RATE_20K_50K: '₹20K – ₹50K',
  RATE_50K_1L: '₹50K – ₹1L',
  RATE_1L_5L: '₹1L – ₹5L',
  RATE_5L_PLUS: '₹5L+',
  OPEN_TO_NEGOTIATE: 'Open to Negotiate',
};

const COLLAB_TYPE_LABEL: Record<string, string> = {
  PAID_CAMPAIGNS: 'Paid Campaign',
  PRODUCT_EXCHANGE: 'Product Exchange',
  AFFILIATE: 'Affiliate',
  BRAND_AMBASSADOR: 'Brand Ambassador',
  EVENT_APPEARANCES: 'Event',
  HYBRID: 'Hybrid',
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
};

// ── component ────────────────────────────────────────────────────────────────

export function CreatorDashboard() {
  const { user } = useAuth();

  // Fetch all creator profiles, find own by userId
  const { data: profiles } = useQuery({
    queryKey: ['creatorProfiles'],
    queryFn: getCreatorProfiles,
    enabled: !!user,
  });

  const profile = profiles?.find((p) => p.user?.id === user?.id || (p as any).userId === user?.id);
  const creatorId = profile?.id;

  const { data: stats } = useQuery({
    queryKey: ['creatorStats', creatorId],
    queryFn: () => getCreatorStats(creatorId!),
    enabled: !!creatorId,
  });

  const { data: collaborations } = useQuery({
    queryKey: ['recentCollaborations', creatorId],
    queryFn: () => getRecentCollaborations(creatorId!),
    enabled: !!creatorId,
  });

  const { data: messages } = useQuery({
    queryKey: ['recentMessages', creatorId],
    queryFn: () => getRecentMessages(creatorId!),
    enabled: !!creatorId,
  });

  // Social accounts bar chart — compute max for proportional bars
  const socialAccounts = (profile as any)?.socialAccounts ?? [];
  const maxFollowers = Math.max(...socialAccounts.map((a: any) => a.followerCount), 1);

  // Initials fallback for avatar
  const initials = profile
    ? `${(profile as any).firstName?.[0] ?? ''}${(profile as any).lastName?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6 items-start">

        {/* ── Left Sidebar: Profile Card ───────────────────────────────── */}
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              {(profile as any)?.profileImageUrl ? (
                <img
                  src={(profile as any).profileImageUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">
                  {(profile as any)?.firstName} {(profile as any)?.lastName}
                </p>
                <p className="text-sm text-gray-500">@{(profile as any)?.displayName}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Bio */}
            {(profile as any)?.bio && (
              <p className="text-sm text-gray-600 line-clamp-3">{(profile as any).bio}</p>
            )}

            {/* Categories */}
            {(profile as any)?.categories?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(profile as any).categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 font-medium"
                  >
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Availability */}
            {(profile as any)?.availability && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Availability</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    AVAILABILITY_LABEL[(profile as any).availability]?.color ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {AVAILABILITY_LABEL[(profile as any).availability]?.label ?? (profile as any).availability}
                </span>
              </div>
            )}

            {/* Rate Range */}
            {(profile as any)?.rateRange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Rate</span>
                <span className="text-xs font-semibold text-gray-800">
                  {RATE_LABEL[(profile as any).rateRange] ?? (profile as any).rateRange}
                </span>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Edit Profile */}
            <button className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition">
              Edit Profile
            </button>
          </div>
        </aside>

        {/* ── Main Area ────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col gap-6">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Profile Views', value: stats?.profileViews, icon: '👁' },
              { label: 'Collaborations', value: stats?.collaborationCount, icon: '🤝' },
              { label: 'Messages', value: stats?.messageCount, icon: '💬' },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Accounts Bar Chart */}
          {socialAccounts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Social Reach</h2>
              <div className="flex flex-col gap-3">
                {socialAccounts.map((account: any) => (
                  <div key={account.id} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-gray-600 font-medium truncate">
                      {account.platform}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(account.followerCount / maxFollowers) * 100}%`,
                          backgroundColor: PLATFORM_COLORS[account.platform] ?? '#6B7280',
                        }}
                      />
                    </div>
                    <span className="w-12 text-xs text-gray-600 text-right font-semibold">
                      {formatFollowers(account.followerCount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Collaborations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Collaborations</h2>
            {collaborations?.length ? (
              <div className="flex flex-col gap-3">
                {collaborations.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                        {c.brandName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.brandName}</p>
                        <p className="text-xs text-gray-500">{COLLAB_TYPE_LABEL[c.type] ?? c.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No collaborations yet</p>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Messages</h2>
            {messages?.length ? (
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                          {m.brandName[0]}
                        </div>
                        {!m.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.brandName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{m.preview}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{formatDate(m.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
```

**Step 2: Verify in browser**

- `cd frontend && npm run dev`
- Log in as a creator → should redirect to `/dashboard/creator`
- Left sidebar should show profile card with name, bio, categories, availability, rate
- Stats row shows 1284 / 3 / 3
- Social reach bars show proportional bars for each linked platform
- Recent collaborations shows 3 mock rows with status chips
- Recent messages shows 3 mock rows with unread dot indicator

**Step 3: Commit**

```bash
git add frontend/src/pages/dashboard/CreatorDashboard.tsx
git commit -m "feat: implement creator dashboard with profile sidebar, stats, social reach, collaborations and messages"
```

---

## Verification Checklist

1. `cd backend && npm run start:dev` — no errors
2. `cd frontend && npm run dev` — no TypeScript errors
3. Login as creator → lands on `/dashboard/creator`
4. Sidebar shows: avatar initials, name, @username, bio, category chips, availability badge, rate range, Edit Profile button
5. Stats row shows profile views / collaboration count / message count from API
6. Social reach section shows horizontal bars proportional to follower counts, colored by platform
7. Recent collaborations shows brand name, collab type, status chip, date
8. Recent messages shows brand name, preview, unread dot for unread messages, date
9. Refresh page → data persists (TanStack Query refetches, auth store rehydrates from localStorage)
