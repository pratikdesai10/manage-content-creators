# Module: Models

## Purpose
- Data classes for serialization/deserialization with `json_serializable`

## Responsibilities
- Define typed models matching backend API responses
- Provide `fromJson()` / `toJson()` factory methods
- Define `UserRole` enum

## Folder Structure
```
models/
├── user.dart              — User, AuthResponse, UserRole enum
├── user.g.dart            — Generated serialization
├── creator_profile.dart   — CreatorProfile (id, displayName, bio, niche, socialAccounts)
├── creator_profile.g.dart — Generated
├── agency_profile.dart    — AgencyProfile (id, companyName, description, website)
├── agency_profile.g.dart  — Generated
├── social_account.dart    — SocialAccount (platform, handle, followersCount)
└── social_account.g.dart  — Generated
```

## Key Components
- **UserRole** — `CREATOR`, `AGENCY` (with `@JsonValue` annotations)
- **User** — `id`, `email`, `role`, `createdAt`, `updatedAt`
- **AuthResponse** — `accessToken` (`@JsonKey(name: 'access_token')`), `user`
- **CreatorProfile** — `id`, `userId`, `displayName`, `bio`, `niche[]`, `location`, `socialAccounts[]`, `user`
- **AgencyProfile** — `id`, `userId`, `companyName`, `description`, `website`, `location`, `user`
- **SocialAccount** — `id`, `platform`, `handle`, `followersCount`, `creatorId`

## Dependencies
- External: `json_annotation`, `json_serializable` (dev)

## Integration
- Used by `AuthService`, `AuthNotifier`, and screen widgets
- Mirror TypeScript interfaces in `frontend/src/types/`

## Conventions
- All models use `@JsonSerializable()` annotation
- Run `dart run build_runner build --delete-conflicting-outputs` after changes
- Never edit `.g.dart` files manually
- Keep in sync with backend Prisma schema and frontend types
