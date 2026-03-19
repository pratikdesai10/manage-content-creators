# Module: API

## Purpose
- HTTP client layer for communicating with the backend

## Responsibilities
- Configure Axios instance with base URL and interceptors
- Attach JWT Bearer token to all requests
- Auto-logout on 401 responses
- Provide typed endpoint functions for auth operations

## Folder Structure
```
api/
├── axios.ts      — Axios instance with interceptors
└── endpoints.ts  — API endpoint functions
```

## Key Components
- **api (axios.ts)** — Axios instance, base URL from `VITE_API_URL`
  - Request interceptor: reads token from Zustand auth store, attaches `Authorization: Bearer`
  - Response interceptor: calls `logout()` on 401
- **registerCreator(data)** — POST `/auth/register/creator`, cleans empty optional fields
- **registerAgency(data)** — POST `/auth/register/agency`, transforms form data to backend payload
- **login(email, password)** — POST `/auth/login` → `AuthResponse`; maps `accessToken` → `access_token`
- **checkUsername(username)** — GET `/auth/check-username/{username}` → `{available: boolean}`
- **checkEmail(email)** — GET `/auth/check-email/{email}` → `{available: boolean}`
- **getCreatorProfiles()** — GET `/creators` → `CreatorProfile[]`
- **getCreatorStats(creatorId)** — GET `/creators/:id/stats` → `DashboardStats`
- **getRecentCollaborations(creatorId)** — GET `/creators/:id/collaborations` → `Collaboration[]`
- **getRecentMessages(creatorId)** — GET `/creators/:id/messages` → `DashboardMessage[]`
- **getCollaborationDetail(creatorId, collabId)** — GET `/creators/:id/collaborations/:collabId` → `CollaborationDetail`
- **getMessageThread(creatorId, messageId)** — GET `/creators/:id/messages/:messageId/thread` → `MessageWithThread`
- **getSocialAccountDetail(creatorId, accountId)** — GET `/creators/:id/social-accounts/:accountId` → `SocialAccountDetail`
- **getAgencyProfiles()** — GET `/agencies` → `AgencyProfile[]`
- **getAgencyStats(agencyId)** — GET `/agencies/:id/stats` → `AgencyDashboardStats`
- **getAgencyCampaigns(agencyId)** — GET `/agencies/:id/campaigns` → `AgencyCampaign[]`
- **getAgencyMessages(agencyId)** — GET `/agencies/:id/messages` → `AgencyMessage[]`
- **getAgencyCampaignDetail(agencyId, campaignId)** — GET `/agencies/:id/campaigns/:campaignId` → `AgencyCampaign`
- **getAgencyMessageThread(agencyId, messageId)** — GET `/agencies/:id/messages/:messageId/thread` → `AgencyMessageWithThread`
- **getAgencyTopCreators(agencyId)** — GET `/agencies/:id/top-creators` → `TopCreator[]`
- **getCreatorProfile(id)** — GET `/creators/:id` → `CreatorProfile`
- **getAgencyProfile(id)** — GET `/agencies/:id` → `AgencyProfile`
- **updateCreatorProfile(id, payload)** — PATCH `/creators/:id` → `CreatorProfile`
- **updateAgencyProfile(id, payload)** — PATCH `/agencies/:id` → `AgencyProfile`
- **changePassword(data)** — Mocked (no backend), logs + 500ms delay
- **updateAccountEmail(data)** — Mocked (no backend), logs + 500ms delay
- **deleteAccount()** — Mocked (no backend), logs + 500ms delay
- **resendVerificationEmail()** — Mocked (no backend), logs + 500ms delay

## Types Defined in endpoints.ts
- **DashboardStats** — `{profileViews, collaborationCount, messageCount}`
- **Collaboration** — `{id, brandName, brandLogo, type, status, createdAt}`
- **DashboardMessage** — `{id, brandName, preview, isRead, createdAt}`
- **CollaborationDetail** — extends `Collaboration` with `{brief, deliverables, timeline, budget, contactPerson, contactEmail}`
- **MessageThreadEntry** — `{id, sender: 'BRAND'|'CREATOR', text, sentAt}`
- **MessageWithThread** — extends `DashboardMessage` with `{threads: MessageThreadEntry[]}`
- **SocialAccountDetail** — `{id, platform, handle, followerCount, engagementRate, avgLikes, growthPercent, topContentType}`
- **AgencyDashboardStats** — `{activeCampaigns, creatorsContacted, totalSpend, messageCount, unreadMessages}`
- **AgencyCampaign** — `{id, creatorName, creatorAvatar, type, status, brief, deliverables, timeline, budget, contactPerson, contactEmail, createdAt}`
- **AgencyMessage** — `{id, creatorName, preview, isRead, createdAt}`
- **AgencyMessageWithThread** — extends `AgencyMessage` with `{threads: MessageThreadEntry[]}`
- **TopCreator** — `{id, name, platform, followers, engagementRate, avatarUrl}`

## Data Flow
- Component calls endpoint fn → Axios interceptor adds token → backend API → response/error

## Dependencies
- Internal: `stores/authStore` (for token and logout)
- External: `axios`

## Integration
- Used by signup pages, Login page, CreatorDashboard, AgencyDashboard, PersonalInfoStep (username/email checks), CreatorDiscovery, CreatorPublicProfile, AgencyPublicProfile, CreatorEditProfile, AgencyEditProfile, Settings, EmailVerification
- Token sourced from Zustand store (not React context)

## Conventions
- All endpoint functions go in `endpoints.ts`
- Always use the shared `api` instance, never create new Axios instances
- Clean/transform data in endpoint functions before sending to backend
- Return `response.data.data` (unwrap backend's `ApiResponse` wrapper)
