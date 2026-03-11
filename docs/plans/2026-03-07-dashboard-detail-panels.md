# Dashboard Detail Panels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make collaboration rows, message rows, and social reach bars on the creator dashboard clickable — each opening an inline detail panel to the right with mock data.

**Architecture:** Three inline panels share a single `activePanel` state in `CreatorDashboard`. Clicking an item sets the active panel type + selected item id; the main area shifts to a two-column layout (content left, panel right). Backend gets new fields on `Collaboration` and `Message` models, a new `MessageThread` model for chat bubbles, and three new GET endpoints. All data is mock-seeded.

**Tech Stack:** React 18, TanStack Query, Tailwind CSS, NestJS, Prisma, PostgreSQL

---

## Phase 1: Backend — Schema Changes

### Task 1: Extend Collaboration model and add MessageThread model

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Add detail fields to the `Collaboration` model**

Inside the existing `Collaboration` model block, add after `createdAt`:
```prisma
  brief          String?
  deliverables   String[]
  timeline       String?
  budget         String?
  contactPerson  String?
  contactEmail   String?
```

**Step 2: Add `MessageThread` model for chat bubbles**

Add after the `Message` model:
```prisma
model MessageThread {
  id        String   @id @default(uuid())
  messageId String
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  sender    String   // "BRAND" | "CREATOR"
  text      String
  sentAt    DateTime @default(now())

  @@index([messageId])
}
```

**Step 3: Add back-relation on `Message`**

Inside the existing `Message` model, add:
```prisma
  threads   MessageThread[]
```

**Step 4: Add mock social analytics fields to `SocialAccount`**

Inside the existing `SocialAccount` model, add after `accountType`:
```prisma
  engagementRate Float   @default(0)
  avgLikes       Int     @default(0)
  growthPercent  Float   @default(0)
  topContentType String?
```

**Step 5: Run migration**
```bash
cd /Users/pratikdesai/projects/manage-content-creators/backend
npx prisma migrate dev --name add_detail_panel_fields
```
Expected: Migration applied successfully.

**Step 6: Regenerate Prisma client**
```bash
npm run db:generate
```

**Step 7: Commit**
```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add detail fields to Collaboration, MessageThread model, social analytics to SocialAccount"
```

---

### Task 2: Update seed script with mock detail data

**Files:**
- Modify: `backend/prisma/seed.ts`

**Step 1: Import `MessageThread` — already available via `PrismaClient`. Add `MessageThread` clearing and seeding.**

Replace the entire seed file content with:

```ts
import { PrismaClient, CollaborationType, CollaborationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({
    take: 3,
    include: { socialAccounts: true },
  });

  if (creators.length === 0) {
    console.warn('No creator profiles found. Register a creator first, then re-run seed.');
    process.exit(1);
  }

  // Clear ALL existing mock data
  await prisma.messageThread.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.message.deleteMany({});

  for (const creator of creators) {
    // ── Collaborations with detail fields ────────────────────────────
    const collabs = await prisma.collaboration.createManyAndReturn({
      data: [
        {
          creatorId: creator.id,
          brandName: 'Zomato',
          brandLogo: null,
          type: CollaborationType.PAID_CAMPAIGNS,
          status: CollaborationStatus.COMPLETED,
          createdAt: new Date('2026-02-01'),
          brief: 'Promote Zomato\'s new 10-minute delivery feature through 3 Instagram Reels highlighting speed and convenience in daily life.',
          deliverables: ['3 Instagram Reels', '5 Stories', '1 YouTube Short'],
          timeline: '15 Feb – 28 Feb 2026',
          budget: '₹45,000',
          contactPerson: 'Riya Sharma',
          contactEmail: 'riya.sharma@zomato.com',
        },
        {
          creatorId: creator.id,
          brandName: 'Boat',
          brandLogo: null,
          type: CollaborationType.BRAND_AMBASSADOR,
          status: CollaborationStatus.ACTIVE,
          createdAt: new Date('2026-02-15'),
          brief: 'Long-term brand ambassador for boAt\'s Airdopes 141 TWS earbuds. Monthly content featuring the product in lifestyle and fitness scenarios.',
          deliverables: ['2 Reels/month', '8 Stories/month', '1 unboxing video'],
          timeline: 'Feb 2026 – Jul 2026',
          budget: '₹1,20,000 total',
          contactPerson: 'Arjun Mehta',
          contactEmail: 'arjun@boat-lifestyle.com',
        },
        {
          creatorId: creator.id,
          brandName: 'Mamaearth',
          brandLogo: null,
          type: CollaborationType.PRODUCT_EXCHANGE,
          status: CollaborationStatus.COMPLETED,
          createdAt: new Date('2026-01-20'),
          brief: 'Review and unboxing of Mamaearth\'s new Vitamin C face wash range. Honest review format preferred.',
          deliverables: ['1 YouTube review (8+ min)', '3 Instagram Stories'],
          timeline: '25 Jan – 5 Feb 2026',
          budget: 'Products worth ₹3,500',
          contactPerson: 'Priya Nair',
          contactEmail: 'influencer@mamaearth.in',
        },
      ],
    });

    // ── Messages with thread data ────────────────────────────────────
    const nikeMsg = await prisma.message.create({
      data: {
        creatorId: creator.id,
        brandName: 'Nike India',
        preview: 'Hi! We loved your recent reel and would love to discuss a campaign...',
        isRead: false,
        createdAt: new Date('2026-03-06'),
      },
    });

    const nykaaMsg = await prisma.message.create({
      data: {
        creatorId: creator.id,
        brandName: 'Nykaa',
        preview: "We're launching a new skincare line and think you'd be a great fit...",
        isRead: true,
        createdAt: new Date('2026-03-04'),
      },
    });

    const lenskartMsg = await prisma.message.create({
      data: {
        creatorId: creator.id,
        brandName: 'Lenskart',
        preview: 'Partnership opportunity for our upcoming summer collection...',
        isRead: false,
        createdAt: new Date('2026-03-01'),
      },
    });

    // ── Message threads ──────────────────────────────────────────────
    await prisma.messageThread.createMany({
      data: [
        { messageId: nikeMsg.id, sender: 'BRAND', text: 'Hi! We loved your recent reel on fitness routines and would love to discuss a potential campaign for our new Air Max line.', sentAt: new Date('2026-03-06T09:00:00') },
        { messageId: nikeMsg.id, sender: 'CREATOR', text: 'Hey! Thanks so much, really appreciate it. Would love to hear more about the campaign. What kind of content are you looking for?', sentAt: new Date('2026-03-06T09:45:00') },
        { messageId: nikeMsg.id, sender: 'BRAND', text: 'We\'re thinking 2 Reels and 5 Stories over a 2-week window. Budget is around ₹60K. Would that work for you?', sentAt: new Date('2026-03-06T10:15:00') },
        { messageId: nikeMsg.id, sender: 'CREATOR', text: 'That sounds great! Let me check my calendar and get back to you by EOD.', sentAt: new Date('2026-03-06T11:00:00') },

        { messageId: nykaaMsg.id, sender: 'BRAND', text: "We're launching a new Vitamin C skincare line next month and think you'd be a perfect fit. Interested in a collaboration?", sentAt: new Date('2026-03-04T11:00:00') },
        { messageId: nykaaMsg.id, sender: 'CREATOR', text: 'Hi Nykaa team! Yes, definitely interested. Could you share more details about the deliverables?', sentAt: new Date('2026-03-04T12:30:00') },
        { messageId: nykaaMsg.id, sender: 'BRAND', text: "We'd need 1 YouTube review (10+ min), 3 Instagram Reels, and a blog post. Full product kit will be sent to you.", sentAt: new Date('2026-03-04T14:00:00') },

        { messageId: lenskartMsg.id, sender: 'BRAND', text: 'Hello! We have an exciting partnership opportunity for our upcoming summer sunglasses collection. Would love to explore this with you.', sentAt: new Date('2026-03-01T10:00:00') },
        { messageId: lenskartMsg.id, sender: 'CREATOR', text: 'Hi Lenskart! That sounds fun. I love eyewear content. What\'s the timeline looking like?', sentAt: new Date('2026-03-01T15:00:00') },
      ],
    });

    // ── Social account analytics ─────────────────────────────────────
    for (const account of creator.socialAccounts) {
      const mockData: Record<string, { engagementRate: number; avgLikes: number; growthPercent: number; topContentType: string }> = {
        INSTAGRAM: { engagementRate: 4.8, avgLikes: 2340, growthPercent: 12.5, topContentType: 'Reels' },
        YOUTUBE: { engagementRate: 6.2, avgLikes: 890, growthPercent: 8.3, topContentType: 'Long-form video' },
        TWITTER: { engagementRate: 2.1, avgLikes: 340, growthPercent: 3.7, topContentType: 'Threads' },
        FACEBOOK: { engagementRate: 1.8, avgLikes: 210, growthPercent: -1.2, topContentType: 'Static posts' },
        TIKTOK: { engagementRate: 9.4, avgLikes: 5600, growthPercent: 22.1, topContentType: 'Short video' },
        LINKEDIN: { engagementRate: 3.5, avgLikes: 180, growthPercent: 5.8, topContentType: 'Articles' },
        BLOG: { engagementRate: 1.2, avgLikes: 45, growthPercent: 2.0, topContentType: 'Long-form posts' },
      };

      const data = mockData[account.platform] ?? { engagementRate: 2.0, avgLikes: 100, growthPercent: 1.0, topContentType: 'Mixed' };

      await prisma.socialAccount.update({
        where: { id: account.id },
        data,
      });
    }

    console.log(`Seeded data for creator: ${creator.displayName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

> **Note:** `createManyAndReturn` requires Prisma 5.14+. If it fails, use three separate `prisma.collaboration.create()` calls instead and collect the results in an array.

**Step 2: Run seed**
```bash
cd /Users/pratikdesai/projects/manage-content-creators/backend
npm run db:seed
```
Expected: `Seeded data for creator: testuser123`

**Step 3: Commit**
```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add backend/prisma/seed.ts
git commit -m "feat: update seed with collaboration details, message threads, social analytics"
```

---

## Phase 2: Backend — New API Endpoints

### Task 3: Add service methods for detail data

**Files:**
- Modify: `backend/src/creator/creator.service.ts`

**Step 1: Add three new methods after `getRecentMessages`:**

```ts
async getCollaborationDetail(creatorId: string, collaborationId: string) {
  await this.findOne(creatorId);
  const collab = await this.prisma.collaboration.findUnique({
    where: { id: collaborationId },
  });
  if (!collab || collab.creatorId !== creatorId) {
    throw new NotFoundException(`Collaboration ${collaborationId} not found`);
  }
  return collab;
}

async getMessageThread(creatorId: string, messageId: string) {
  await this.findOne(creatorId);
  const message = await this.prisma.message.findUnique({
    where: { id: messageId },
    include: {
      threads: { orderBy: { sentAt: 'asc' } },
    },
  });
  if (!message || message.creatorId !== creatorId) {
    throw new NotFoundException(`Message ${messageId} not found`);
  }
  return message;
}

async getSocialAccountDetail(creatorId: string, accountId: string) {
  await this.findOne(creatorId);
  const account = await this.prisma.socialAccount.findUnique({
    where: { id: accountId },
  });
  if (!account || account.creatorProfileId !== creatorId) {
    throw new NotFoundException(`Social account ${accountId} not found`);
  }
  return account;
}
```

**Step 2: Commit**
```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add backend/src/creator/creator.service.ts
git commit -m "feat: add getCollaborationDetail, getMessageThread, getSocialAccountDetail to CreatorService"
```

---

### Task 4: Add controller endpoints for detail data

**Files:**
- Modify: `backend/src/creator/creator.controller.ts`

**Step 1: Add three new routes after `getMessages`:**

```ts
@UseGuards(JwtAuthGuard, CreatorGuard)
@Get(':id/collaborations/:collabId')
async getCollaborationDetail(
  @Param('id') id: string,
  @Param('collabId') collabId: string,
  @CurrentUser() user: User,
) {
  const profile = await this.creatorService.findOne(id);
  if (profile.userId !== user.id) {
    throw new ForbiddenException('Access restricted to profile owner');
  }
  return this.creatorService.getCollaborationDetail(id, collabId);
}

@UseGuards(JwtAuthGuard, CreatorGuard)
@Get(':id/messages/:messageId/thread')
async getMessageThread(
  @Param('id') id: string,
  @Param('messageId') messageId: string,
  @CurrentUser() user: User,
) {
  const profile = await this.creatorService.findOne(id);
  if (profile.userId !== user.id) {
    throw new ForbiddenException('Access restricted to profile owner');
  }
  return this.creatorService.getMessageThread(id, messageId);
}

@UseGuards(JwtAuthGuard, CreatorGuard)
@Get(':id/social-accounts/:accountId')
async getSocialAccountDetail(
  @Param('id') id: string,
  @Param('accountId') accountId: string,
  @CurrentUser() user: User,
) {
  const profile = await this.creatorService.findOne(id);
  if (profile.userId !== user.id) {
    throw new ForbiddenException('Access restricted to profile owner');
  }
  return this.creatorService.getSocialAccountDetail(id, accountId);
}
```

**Step 2: Verify endpoints work**

Start backend: `cd backend && npm run start:dev`

```bash
# Login and get token + creatorId
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])")

CREATOR_ID=$(curl -s http://localhost:3000/creators \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])")

COLLAB_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/creators/$CREATOR_ID/collaborations \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])")

curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/creators/$CREATOR_ID/collaborations/$COLLAB_ID \
  | python3 -m json.tool | head -20
```

Expected: collaboration with `brief`, `deliverables`, `budget`, `timeline`, `contactPerson`, `contactEmail` fields.

**Step 3: Commit**
```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add backend/src/creator/creator.controller.ts
git commit -m "feat: add collaboration detail, message thread, social account detail endpoints"
```

---

## Phase 3: Frontend — API Functions

### Task 5: Add frontend endpoint functions and types

**Files:**
- Modify: `frontend/src/api/endpoints.ts`
- Modify: `frontend/src/types/index.ts`

**Step 1: Add types to `frontend/src/types/index.ts`**

Read the file first, then add after `SocialAccount`:

```ts
export interface MessageThreadEntry {
  id: string;
  messageId: string;
  sender: 'BRAND' | 'CREATOR';
  text: string;
  sentAt: string;
}

export interface MessageWithThread extends DashboardMessage {
  threads: MessageThreadEntry[];
}
```

> Note: `DashboardMessage` is defined in `endpoints.ts` — move it to `types/index.ts` or keep as-is and import. To avoid circular imports, define `MessageWithThread` inline in `endpoints.ts` instead.

**Step 2: Add to `frontend/src/api/endpoints.ts`** (read file first):

```ts
export interface CollaborationDetail extends Collaboration {
  brief: string | null;
  deliverables: string[];
  timeline: string | null;
  budget: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
}

export interface MessageThreadEntry {
  id: string;
  sender: 'BRAND' | 'CREATOR';
  text: string;
  sentAt: string;
}

export interface MessageWithThread extends DashboardMessage {
  threads: MessageThreadEntry[];
}

export interface SocialAccountDetail {
  id: string;
  platform: string;
  handle: string;
  followerCount: number;
  engagementRate: number;
  avgLikes: number;
  growthPercent: number;
  topContentType: string | null;
}

export async function getCollaborationDetail(creatorId: string, collabId: string): Promise<CollaborationDetail> {
  const { data } = await apiClient.get<{ data: CollaborationDetail }>(
    `/creators/${creatorId}/collaborations/${collabId}`
  );
  return data.data;
}

export async function getMessageThread(creatorId: string, messageId: string): Promise<MessageWithThread> {
  const { data } = await apiClient.get<{ data: MessageWithThread }>(
    `/creators/${creatorId}/messages/${messageId}/thread`
  );
  return data.data;
}

export async function getSocialAccountDetail(creatorId: string, accountId: string): Promise<SocialAccountDetail> {
  const { data } = await apiClient.get<{ data: SocialAccountDetail }>(
    `/creators/${creatorId}/social-accounts/${accountId}`
  );
  return data.data;
}
```

**Step 3: Commit**
```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add frontend/src/api/endpoints.ts frontend/src/types/index.ts
git commit -m "feat: add detail panel API functions and types to frontend"
```

---

## Phase 4: Frontend — Detail Panel UI

### Task 6: Build detail panel components and wire dashboard

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorDashboard.tsx`

**Step 1: Read the current file fully, then replace with the updated version.**

The key changes:
1. Add `activePanel` state: `{ type: 'collab' | 'message' | 'social'; id: string } | null`
2. When panel is open, main area uses `grid grid-cols-2 gap-4` instead of `flex flex-col`
3. Left column: existing content (narrowed), right column: active panel
4. Each clickable row/bar gets `cursor-pointer hover:bg-gray-50` and `onClick`
5. Three new panel components: `CollabDetailPanel`, `ChatPanel`, `SocialDetailPanel`

**Full updated `CreatorDashboard.tsx`:**

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import {
  getCreatorProfiles,
  getCreatorStats,
  getRecentCollaborations,
  getRecentMessages,
  getCollaborationDetail,
  getMessageThread,
  getSocialAccountDetail,
  type Collaboration,
  type DashboardMessage,
  type CollaborationDetail,
  type MessageWithThread,
  type SocialAccountDetail,
} from '../../api/endpoints';
import type { CreatorProfile, SocialAccount } from '../../types';
import { AVAILABILITY_LABELS, RATE_RANGE_LABELS } from '../../types/creator.types';

// ── helpers ───────────────────────────────────────────────────────────────────

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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const COLLAB_TYPE_LABEL: Record<string, string> = {
  PAID_CAMPAIGNS: 'Paid Campaign',
  PRODUCT_EXCHANGE: 'Product Exchange',
  AFFILIATE: 'Affiliate',
  BRAND_AMBASSADOR: 'Brand Ambassador',
  EVENT_APPEARANCES: 'Event',
  HYBRID: 'Hybrid',
};

type ActivePanel = { type: 'collab'; id: string } | { type: 'message'; id: string } | { type: 'social'; id: string } | null;

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number | undefined; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Collaboration Detail Panel ────────────────────────────────────────────────

function CollabDetailPanel({
  creatorId,
  collabId,
  onClose,
}: {
  creatorId: string;
  collabId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['collabDetail', collabId],
    queryFn: () => getCollaborationDetail(creatorId, collabId),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Collaboration Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : data ? (
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-500">
              {data.brandName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{data.brandName}</p>
              <p className="text-xs text-gray-500">{COLLAB_TYPE_LABEL[data.type] ?? data.type}</p>
            </div>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[data.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {data.status}
            </span>
          </div>

          <hr className="border-gray-100" />

          {data.brief && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Campaign Brief</p>
              <p className="text-sm text-gray-700 leading-relaxed">{data.brief}</p>
            </div>
          )}

          {data.deliverables && data.deliverables.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Deliverables</p>
              <ul className="flex flex-col gap-1">
                {data.deliverables.map((d, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {data.timeline && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Timeline</p>
                <p className="text-sm font-medium text-gray-800">{data.timeline}</p>
              </div>
            )}
            {data.budget && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                <p className="text-sm font-medium text-gray-800">{data.budget}</p>
              </div>
            )}
          </div>

          {(data.contactPerson || data.contactEmail) && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-700 mb-1">Brand Contact</p>
              {data.contactPerson && <p className="text-sm text-gray-800 font-medium">{data.contactPerson}</p>}
              {data.contactEmail && <p className="text-xs text-gray-500">{data.contactEmail}</p>}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">Could not load details.</p>
      )}
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────

function ChatPanel({
  creatorId,
  messageId,
  onClose,
}: {
  creatorId: string;
  messageId: string;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['messageThread', messageId],
    queryFn: () => getMessageThread(creatorId, messageId),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
            {data?.brandName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <p className="text-sm font-semibold text-gray-800">{data?.brandName ?? '…'}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
        ) : data?.threads?.length ? (
          data.threads.map((entry) => (
            <div
              key={entry.id}
              className={`flex flex-col max-w-[80%] ${entry.sender === 'CREATOR' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  entry.sender === 'CREATOR'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {entry.text}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 px-1">{formatTime(entry.sentAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a reply…"
          className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
          onKeyDown={(e) => e.key === 'Enter' && setDraft('')}
        />
        <button
          onClick={() => setDraft('')}
          className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ── Social Detail Panel ───────────────────────────────────────────────────────

function SocialDetailPanel({
  creatorId,
  accountId,
  onClose,
}: {
  creatorId: string;
  accountId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['socialDetail', accountId],
    queryFn: () => getSocialAccountDetail(creatorId, accountId),
  });

  const platformColor = data ? PLATFORM_COLORS[data.platform] ?? '#6B7280' : '#6B7280';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Platform Analytics</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : data ? (
        <>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: platformColor }}
            >
              {data.platform[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{data.platform}</p>
              <p className="text-xs text-gray-500">@{data.handle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Followers</p>
              <p className="text-lg font-bold text-gray-900">{formatFollowers(data.followerCount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Engagement Rate</p>
              <p className="text-lg font-bold text-gray-900">{data.engagementRate}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Avg Likes</p>
              <p className="text-lg font-bold text-gray-900">{formatFollowers(data.avgLikes)}</p>
            </div>
            <div className={`rounded-lg p-3 ${(data.growthPercent ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-500 mb-0.5">Growth (this month)</p>
              <p className={`text-lg font-bold ${(data.growthPercent ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {(data.growthPercent ?? 0) >= 0 ? '+' : ''}{data.growthPercent}%
              </p>
            </div>
          </div>

          {data.topContentType && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-semibold mb-0.5">Top Performing Content</p>
              <p className="text-sm font-medium text-gray-800">{data.topContentType}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">Could not load analytics.</p>
      )}
    </div>
  );
}

// ── Social Reach (clickable bars) ─────────────────────────────────────────────

function SocialReach({
  accounts,
  selectedId,
  onSelect,
}: {
  accounts: SocialAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (accounts.length === 0) return null;
  const maxFollowers = Math.max(...accounts.map((a) => a.followerCount), 1);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Social Reach</h2>
      <div className="flex flex-col gap-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            onClick={() => onSelect(account.id)}
            className={`flex items-center gap-3 cursor-pointer rounded-lg p-2 -mx-2 transition ${
              selectedId === account.id ? 'bg-purple-50' : 'hover:bg-gray-50'
            }`}
          >
            <span className="w-24 text-xs text-gray-600 font-medium truncate">{account.platform}</span>
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
  );
}

// ── Collaborations List (clickable rows) ──────────────────────────────────────

function CollaborationsList({
  collaborations,
  selectedId,
  onSelect,
}: {
  collaborations: Collaboration[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Collaborations</h2>
      {collaborations?.length ? (
        <div className="flex flex-col">
          {collaborations.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg cursor-pointer border-b border-gray-50 last:border-0 transition ${
                selectedId === c.id ? 'bg-purple-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                  {c.brandName?.[0]?.toUpperCase() ?? '?'}
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
  );
}

// ── Messages List (clickable rows) ────────────────────────────────────────────

function MessagesList({
  messages,
  selectedId,
  onSelect,
}: {
  messages: DashboardMessage[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Messages</h2>
      {messages?.length ? (
        <div className="flex flex-col">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg cursor-pointer border-b border-gray-50 last:border-0 transition ${
                selectedId === m.id ? 'bg-purple-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    {m.brandName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {!m.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.brandName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">{m.preview}</p>
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
  );
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({ profile, userEmail }: { profile: CreatorProfile; userEmail: string | undefined }) {
  const initials = profile.displayName
    ? profile.displayName[0].toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">{profile.displayName}</p>
          <p className="text-sm text-gray-500">@{profile.displayName}</p>
        </div>
      </div>
      <hr className="border-gray-100" />
      {profile.bio && <p className="text-sm text-gray-600 line-clamp-3">{profile.bio}</p>}
      {profile.niche && profile.niche.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.niche.map((cat) => (
            <span key={cat} className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 font-medium">
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      {profile.location && (
        <>
          <hr className="border-gray-100" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Location</span>
            <span className="text-xs font-semibold text-gray-800">{profile.location}</span>
          </div>
        </>
      )}
      {(profile.availability || profile.rateRange) && (
        <>
          <hr className="border-gray-100" />
          {profile.availability && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Availability</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.availability === 'IMMEDIATELY' ? 'bg-green-100 text-green-700' : profile.availability === 'NOT_AVAILABLE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {AVAILABILITY_LABELS[profile.availability as keyof typeof AVAILABILITY_LABELS] ?? profile.availability}
              </span>
            </div>
          )}
          {profile.rateRange && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rate</span>
              <span className="text-xs font-semibold text-gray-800">
                {RATE_RANGE_LABELS[profile.rateRange as keyof typeof RATE_RANGE_LABELS] ?? profile.rateRange}
              </span>
            </div>
          )}
        </>
      )}
      <hr className="border-gray-100" />
      <button className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition">
        Edit Profile
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function CreatorDashboard() {
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['creatorProfiles'],
    queryFn: getCreatorProfiles,
    enabled: !!user,
  });

  const profile = profiles?.find((p) => p.user?.id === user?.id);
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

  const socialAccounts = profile?.socialAccounts ?? [];

  const panelOpen = activePanel !== null;
  const selectedCollabId = activePanel?.type === 'collab' ? activePanel.id : null;
  const selectedMessageId = activePanel?.type === 'message' ? activePanel.id : null;
  const selectedSocialId = activePanel?.type === 'social' ? activePanel.id : null;

  function openPanel(type: ActivePanel['type'], id: string) {
    setActivePanel((prev) =>
      prev?.type === type && prev.id === id ? null : { type, id }
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-72 flex-shrink-0">
          {profilesLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">Loading profile…</p>
            </div>
          ) : profile ? (
            <ProfileCard profile={profile as any} userEmail={user?.email} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">No creator profile found.</p>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <div className="flex-1 min-w-0">
          <div className={`${panelOpen ? 'grid grid-cols-2 gap-4 items-start' : 'flex flex-col gap-6'}`}>
            {/* Left column — existing content */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Profile Views" value={stats?.profileViews} icon="👁" />
                <StatCard label="Collaborations" value={stats?.collaborationCount} icon="🤝" />
                <StatCard label="Messages" value={stats?.messageCount} icon="💬" />
              </div>

              <SocialReach
                accounts={socialAccounts}
                selectedId={selectedSocialId}
                onSelect={(id) => openPanel('social', id)}
              />
              <CollaborationsList
                collaborations={collaborations}
                selectedId={selectedCollabId}
                onSelect={(id) => openPanel('collab', id)}
              />
              <MessagesList
                messages={messages}
                selectedId={selectedMessageId}
                onSelect={(id) => openPanel('message', id)}
              />
            </div>

            {/* Right column — detail panel */}
            {panelOpen && creatorId && (
              <div className="sticky top-6">
                {activePanel.type === 'collab' && (
                  <CollabDetailPanel
                    creatorId={creatorId}
                    collabId={activePanel.id}
                    onClose={() => setActivePanel(null)}
                  />
                )}
                {activePanel.type === 'message' && (
                  <ChatPanel
                    creatorId={creatorId}
                    messageId={activePanel.id}
                    onClose={() => setActivePanel(null)}
                  />
                )}
                {activePanel.type === 'social' && (
                  <SocialDetailPanel
                    creatorId={creatorId}
                    accountId={activePanel.id}
                    onClose={() => setActivePanel(null)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify**
- `cd frontend && npm run build` — no TypeScript errors
- Login, open dashboard
- Click a collaboration row → detail panel opens on right, main content narrows to 2-col
- Click same row again → panel closes
- Click a message → chat panel opens with message bubbles
- Click a social reach bar → analytics panel opens
- Click × → panel closes

**Step 3: Commit**
```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add frontend/src/pages/dashboard/CreatorDashboard.tsx
git commit -m "feat: add clickable detail panels for collaborations, messages, and social reach"
```

---

## Verification Checklist

1. Backend starts without errors: `cd backend && npm run start:dev`
2. Seed runs: `cd backend && npm run db:seed`
3. Frontend builds: `cd frontend && npm run build`
4. Dashboard loads with all existing data
5. Click collab row → right panel shows brief, deliverables, budget, timeline, contact
6. Click same row again → panel closes (toggle)
7. Click different collab → panel switches
8. Click message row → chat panel with bubble thread
9. Click send (no-op) → input clears
10. Click social reach bar → platform analytics panel
11. Growth % shows green for positive, red for negative
12. × button closes any panel
