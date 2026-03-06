# Signup Forms Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build full-stack 5-step signup wizards for Creator and Brand/Agency roles with validation, animations, and backend support.

**Architecture:** Backend-first approach — expand Prisma schema and DTOs, then build frontend wizards consuming the new API shape. Frontend uses a single react-hook-form instance per wizard with per-step Zod validation. Framer-motion handles slide transitions.

**Tech Stack:** NestJS + Prisma (backend), React + react-hook-form + Zod + Tailwind + framer-motion (frontend)

**Spec Reference:** `docs/plans/CollabHub_Signup_Forms_Spec.md`

---

## Phase 1: Backend Schema & API

---

### Task 1: Expand Prisma Schema Enums

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Update enums and add new ones**

Replace the existing enums and add new ones. The full schema changes:

```prisma
enum UserRole {
  CREATOR
  AGENCY
}

enum CreatorCategory {
  ENTERTAINMENT
  EDUCATION
  FINANCE
  TECHNOLOGY
  LIFESTYLE
  FITNESS
  TRAVEL
  FOOD
  FASHION
  GAMING
  MUSIC
  PHOTOGRAPHY
  AI_TOOLS
  PARENTING
  PETS
  SPORTS
  COMEDY
  MOTIVATION
  DIY
  AUTOMOTIVE
}

enum SocialPlatform {
  INSTAGRAM
  YOUTUBE
  FACEBOOK
  TWITTER
  TIKTOK
  LINKEDIN
  BLOG
}

enum ContentType {
  REELS
  LONG_FORM_VIDEO
  STATIC_POSTS
  STORIES
  BLOG_ARTICLES
  PODCASTS
  LIVE_STREAMS
  PRODUCT_REVIEWS
  TUTORIALS
}

enum CollaborationType {
  PAID_CAMPAIGNS
  PRODUCT_EXCHANGE
  AFFILIATE
  BRAND_AMBASSADOR
  EVENT_APPEARANCES
  HYBRID
}

enum Availability {
  IMMEDIATELY
  ONE_TWO_WEEKS
  ONE_MONTH
  NOT_AVAILABLE
}

enum TravelScope {
  WITHIN_CITY
  WITHIN_STATE
  ANYWHERE_INDIA
  INTERNATIONAL
}

enum RateRange {
  RATE_1K_5K
  RATE_5K_20K
  RATE_20K_50K
  RATE_50K_1L
  RATE_1L_5L
  RATE_5L_PLUS
  OPEN_TO_NEGOTIATE
}

enum IndustryCategory {
  FASHION_APPAREL
  FOOD_BEVERAGE
  TECHNOLOGY_ELECTRONICS
  FINANCE_FINTECH
  TRAVEL_HOSPITALITY
  BEAUTY_PERSONAL_CARE
  FITNESS_SPORTS
  GAMING_ENTERTAINMENT
  EDUCATION_EDTECH
  HEALTH_PHARMA
  AUTOMOTIVE
  REAL_ESTATE
  D2C_ECOMMERCE
  OTHER
}

enum CompanySize {
  SIZE_1_10
  SIZE_11_50
  SIZE_51_200
  SIZE_201_500
  SIZE_500_PLUS
}

enum BudgetRange {
  BUDGET_5K_20K
  BUDGET_20K_1L
  BUDGET_1L_5L
  BUDGET_5L_PLUS
  VARIES
}

enum PaymentType {
  FIXED
  AFFILIATE
  PRODUCT_EXCHANGE
  HYBRID
  PERFORMANCE_BASED
}

enum PaymentTimeline {
  UPFRONT
  ON_DELIVERY
  FIFTEEN_DAYS
  THIRTY_DAYS
  MILESTONE_BASED
}

enum FollowerRange {
  NANO
  MICRO
  MID_TIER
  MACRO
  MEGA
  ANY
}
```

**Step 2: Run `npx prisma format` to validate syntax**

Run: `cd backend && npx prisma format`
Expected: Schema formatted successfully

---

### Task 2: Expand Prisma Models

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Update User model**

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  firstName    String?
  lastName     String?
  phone        String?
  role         UserRole
  isVerified   Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  creatorProfile CreatorProfile?
  agencyProfile  AgencyProfile?
  refreshTokens  RefreshToken[]
}
```

**Step 2: Update CreatorProfile model**

```prisma
model CreatorProfile {
  id                     String              @id @default(uuid())
  userId                 String              @unique
  user                   User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName              String
  lastName               String
  displayName            String              @unique
  dateOfBirth            DateTime
  gender                 String?
  profileImageUrl        String?
  bio                    String
  languages              String[]
  city                   String
  state                  String
  country                String              @default("India")
  categories             CreatorCategory[]
  contentTypes           ContentType[]
  portfolioUrl           String?
  rateRange              RateRange
  collaborationTypes     CollaborationType[]
  availability           Availability
  willingToTravel        Boolean             @default(false)
  travelScope            TravelScope?
  previousCollaborations Int?
  notableBrands          String[]
  marketingEmails        Boolean             @default(true)
  whatsappNotifications  Boolean             @default(false)

  socialAccounts SocialAccount[]
}
```

**Step 3: Update SocialAccount model**

```prisma
model SocialAccount {
  id               String         @id @default(uuid())
  creatorProfileId String
  creatorProfile   CreatorProfile @relation(fields: [creatorProfileId], references: [id], onDelete: Cascade)
  platform         SocialPlatform
  handle           String
  profileUrl       String?
  followerCount    Int            @default(0)
  accountType      String?
  isVerified       Boolean        @default(false)

  @@unique([creatorProfileId, platform])
}
```

**Step 4: Update AgencyProfile model**

Remove `AgencyProductCategory` enum (replaced by `IndustryCategory`). Update AgencyProfile:

```prisma
model AgencyProfile {
  id                  String           @id @default(uuid())
  userId              String           @unique
  user                User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  brandName           String
  companyLegalName    String
  industry            IndustryCategory
  companySize         CompanySize
  yearFounded         Int?
  gstin               String?
  logoUrl             String?
  website             String
  description         String
  brandSocials        Json?
  city                String
  state               String
  country             String           @default("India")
  pinCode             String?
  targetAudience      Json
  campaignPreferences Json
  marketingEmails     Boolean          @default(true)

  contact AgencyContact?
}
```

**Step 5: Update AgencyContact model**

```prisma
model AgencyContact {
  id                String        @id @default(uuid())
  agencyProfileId   String        @unique
  agencyProfile     AgencyProfile @relation(fields: [agencyProfileId], references: [id], onDelete: Cascade)
  contactPersonName String
  contactEmail      String
  contactPhone      String?
  designation       String
  linkedinUrl       String?
}
```

**Step 6: Remove old `AgencyProductCategory` enum entirely**

Delete the `AgencyProductCategory` enum block from schema.

**Step 7: Generate migration**

Run: `cd backend && npx prisma migrate dev --name expand-signup-models`
Expected: Migration created and applied successfully

Note: If existing data causes issues, run `npx prisma migrate reset` (dev only).

**Step 8: Regenerate Prisma client**

Run: `cd backend && npx prisma generate`
Expected: Prisma client generated

---

### Task 3: Update RegisterCreatorDto

**Files:**
- Rewrite: `backend/src/auth/dto/register-creator.dto.ts`

**Step 1: Write the expanded DTO**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Availability,
  CollaborationType,
  ContentType,
  CreatorCategory,
  RateRange,
  SocialPlatform,
  TravelScope,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SocialAccountDto {
  @ApiProperty({ enum: SocialPlatform })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  handle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  followerCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountType?: string;
}

export class RegisterCreatorDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(500)
  bio: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ enum: CreatorCategory, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum(CreatorCategory, { each: true })
  categories: CreatorCategory[];

  @ApiProperty({ enum: ContentType, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ContentType, { each: true })
  contentTypes: ContentType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({ enum: RateRange })
  @IsEnum(RateRange)
  rateRange: RateRange;

  @ApiProperty({ enum: CollaborationType, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(CollaborationType, { each: true })
  collaborationTypes: CollaborationType[];

  @ApiProperty({ enum: Availability })
  @IsEnum(Availability)
  availability: Availability;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  willingToTravel?: boolean;

  @ApiPropertyOptional({ enum: TravelScope })
  @IsOptional()
  @IsEnum(TravelScope)
  travelScope?: TravelScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  previousCollaborations?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notableBrands?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  whatsappNotifications?: boolean;

  @ApiProperty({ type: [SocialAccountDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SocialAccountDto)
  socialAccounts: SocialAccountDto[];
}
```

**Step 2: Verify compilation**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

---

### Task 4: Update RegisterAgencyDto

**Files:**
- Rewrite: `backend/src/auth/dto/register-agency.dto.ts`

**Step 1: Write the expanded DTO**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanySize, IndustryCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BrandSocialsDto {
  @IsOptional() @IsUrl() instagram?: string;
  @IsOptional() @IsUrl() youtube?: string;
  @IsOptional() @IsUrl() twitter?: string;
  @IsOptional() @IsUrl() facebook?: string;
  @IsOptional() @IsUrl() linkedin?: string;
}

export class TargetAudienceDto {
  @IsArray() @IsString({ each: true }) ageGroups: string[];
  @IsArray() @IsString({ each: true }) genders: string[];
  @IsArray() @IsString({ each: true }) locations: string[];
  @IsOptional() @IsString() incomeBracket?: string;
  @IsArray() @IsString({ each: true }) languages: string[];
}

export class CampaignPreferencesDto {
  @IsArray() @IsString({ each: true }) platforms: string[];
  @IsArray() @IsString({ each: true }) contentTypes: string[];
  @IsString() budgetRange: string;
  @IsArray() @IsString({ each: true }) paymentTypes: string[];
  @IsString() paymentTimeline: string;
  @IsOptional() @IsString() campaignsPerMonth?: string;
  @IsArray() @IsString({ each: true }) preferredFollowerRange: string[];
  @IsArray() @IsString({ each: true }) preferredCreatorCategories: string[];
}

export class RegisterAgencyDto {
  // Step 1: Account Manager
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty()
  @IsEmail()
  workEmail: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  designation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  // Step 2: Brand Details
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  brandName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  companyLegalName: string;

  @ApiProperty()
  @IsUrl()
  website: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ enum: IndustryCategory })
  @IsEnum(IndustryCategory)
  industry: IndustryCategory;

  @ApiProperty({ enum: CompanySize })
  @IsEnum(CompanySize)
  companySize: CompanySize;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2026)
  yearFounded?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BrandSocialsDto)
  brandSocials?: BrandSocialsDto;

  // Step 3: Location
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pinCode?: string;

  // Step 3: Target Audience
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience: TargetAudienceDto;

  // Step 4: Campaign Preferences
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => CampaignPreferencesDto)
  campaignPreferences: CampaignPreferencesDto;

  // Step 5: Consent
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
```

Note: Add missing `IsArray` import from class-validator in the TargetAudienceDto and CampaignPreferencesDto. The import block at the top should include `IsArray`.

**Step 2: Verify compilation**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

---

### Task 5: Update Auth Service Registration Methods

**Files:**
- Modify: `backend/src/auth/auth.service.ts`

**Step 1: Update registerCreator method**

Replace the `registerCreator` method body (lines 26-65) with:

```typescript
async registerCreator(dto: RegisterCreatorDto) {
  const passwordHash = await bcrypt.hash(dto.password, 10);

  const user = await this.prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await tx.creatorProfile.findUnique({
      where: { displayName: dto.displayName },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    return tx.user.create({
      data: {
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        role: 'CREATOR',
        creatorProfile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            displayName: dto.displayName,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender,
            profileImageUrl: dto.profileImageUrl,
            bio: dto.bio,
            languages: dto.languages,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            categories: dto.categories,
            contentTypes: dto.contentTypes,
            portfolioUrl: dto.portfolioUrl,
            rateRange: dto.rateRange,
            collaborationTypes: dto.collaborationTypes,
            availability: dto.availability,
            willingToTravel: dto.willingToTravel ?? false,
            travelScope: dto.travelScope,
            previousCollaborations: dto.previousCollaborations,
            notableBrands: dto.notableBrands ?? [],
            marketingEmails: dto.marketingEmails ?? true,
            whatsappNotifications: dto.whatsappNotifications ?? false,
            socialAccounts: {
              create: dto.socialAccounts.map((sa) => ({
                platform: sa.platform,
                handle: sa.handle,
                profileUrl: sa.profileUrl,
                followerCount: sa.followerCount ?? 0,
                accountType: sa.accountType,
              })),
            },
          },
        },
      },
    });
  });

  return this.generateTokensAndPersist(user);
}
```

**Step 2: Update registerAgency method**

Replace the `registerAgency` method body (lines 67-107) with:

```typescript
async registerAgency(dto: RegisterAgencyDto) {
  const passwordHash = await bcrypt.hash(dto.password, 10);

  const user = await this.prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email: dto.workEmail },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const [firstName, ...lastParts] = dto.fullName.trim().split(/\s+/);
    const lastName = lastParts.join(' ') || '';

    return tx.user.create({
      data: {
        email: dto.workEmail,
        passwordHash,
        firstName,
        lastName: lastName || undefined,
        phone: dto.phone,
        role: 'AGENCY',
        agencyProfile: {
          create: {
            brandName: dto.brandName,
            companyLegalName: dto.companyLegalName,
            industry: dto.industry,
            companySize: dto.companySize,
            yearFounded: dto.yearFounded,
            gstin: dto.gstin,
            logoUrl: dto.logoUrl,
            website: dto.website,
            description: dto.description,
            brandSocials: dto.brandSocials ?? {},
            city: dto.city,
            state: dto.state,
            country: dto.country,
            pinCode: dto.pinCode,
            targetAudience: dto.targetAudience as any,
            campaignPreferences: dto.campaignPreferences as any,
            marketingEmails: dto.marketingEmails ?? true,
            contact: {
              create: {
                contactPersonName: dto.fullName,
                contactEmail: dto.workEmail,
                contactPhone: dto.phone,
                designation: dto.designation,
                linkedinUrl: dto.linkedinUrl,
              },
            },
          },
        },
      },
    });
  });

  return this.generateTokensAndPersist(user);
}
```

**Step 3: Verify compilation**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

---

### Task 6: Add Username/Email Availability Endpoints

**Files:**
- Modify: `backend/src/auth/auth.controller.ts`
- Modify: `backend/src/auth/auth.service.ts`

**Step 1: Add service methods**

Add to `auth.service.ts`:

```typescript
async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  const existing = await this.prisma.creatorProfile.findUnique({
    where: { displayName: username },
  });
  return { available: !existing };
}

async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
  const existing = await this.prisma.user.findUnique({
    where: { email },
  });
  return { available: !existing };
}
```

**Step 2: Add controller endpoints**

Add imports `Get, Param` to `@nestjs/common` import. Add to `auth.controller.ts`:

```typescript
@Public()
@Get('check-username/:username')
checkUsername(@Param('username') username: string) {
  return this.authService.checkUsernameAvailability(username);
}

@Public()
@Get('check-email/:email')
checkEmail(@Param('email') email: string) {
  return this.authService.checkEmailAvailability(email);
}
```

**Step 3: Verify compilation and test manually**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

---

### Task 7: Commit Backend Changes

**Step 1: Commit**

```bash
cd backend
git add prisma/schema.prisma src/auth/
git commit -m "feat(backend): expand signup schema with full creator/agency fields, availability endpoints"
```

---

## Phase 2: Frontend Packages & Types

---

### Task 8: Install Frontend Dependencies

**Files:**
- Modify: `frontend/package.json` (via npm install)

**Step 1: Install framer-motion and canvas-confetti**

Run: `cd frontend && npm install framer-motion canvas-confetti && npm install -D @types/canvas-confetti`
Expected: Packages added to package.json

---

### Task 9: Create TypeScript Types

**Files:**
- Create: `frontend/src/types/creator.types.ts`
- Create: `frontend/src/types/agency.types.ts`

**Step 1: Create creator form types**

```typescript
// frontend/src/types/creator.types.ts

export const SOCIAL_PLATFORMS = [
  'INSTAGRAM', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'LINKEDIN', 'BLOG',
] as const;
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];

export const CREATOR_CATEGORIES = [
  'ENTERTAINMENT', 'EDUCATION', 'FINANCE', 'TECHNOLOGY', 'LIFESTYLE',
  'FITNESS', 'TRAVEL', 'FOOD', 'FASHION', 'GAMING', 'MUSIC',
  'PHOTOGRAPHY', 'AI_TOOLS', 'PARENTING', 'PETS', 'SPORTS',
  'COMEDY', 'MOTIVATION', 'DIY', 'AUTOMOTIVE',
] as const;
export type CreatorCategory = typeof CREATOR_CATEGORIES[number];

export const CATEGORY_LABELS: Record<CreatorCategory, string> = {
  ENTERTAINMENT: 'Entertainment',
  EDUCATION: 'Education',
  FINANCE: 'Finance & Trading',
  TECHNOLOGY: 'Technology',
  LIFESTYLE: 'Lifestyle',
  FITNESS: 'Fitness & Health',
  TRAVEL: 'Travel',
  FOOD: 'Food & Cooking',
  FASHION: 'Fashion & Beauty',
  GAMING: 'Gaming',
  MUSIC: 'Music',
  PHOTOGRAPHY: 'Photography & Videography',
  AI_TOOLS: 'AI & Tools',
  PARENTING: 'Parenting & Family',
  PETS: 'Pets & Animals',
  SPORTS: 'Sports',
  COMEDY: 'Comedy & Memes',
  MOTIVATION: 'Motivation & Self-help',
  DIY: 'DIY & Crafts',
  AUTOMOTIVE: 'Automotive',
};

export const CATEGORY_ICONS: Record<CreatorCategory, string> = {
  ENTERTAINMENT: '🎭', EDUCATION: '📚', FINANCE: '📈', TECHNOLOGY: '💻',
  LIFESTYLE: '✨', FITNESS: '💪', TRAVEL: '✈️', FOOD: '🍳',
  FASHION: '👗', GAMING: '🎮', MUSIC: '🎵', PHOTOGRAPHY: '📷',
  AI_TOOLS: '🤖', PARENTING: '👨‍👩‍👧', PETS: '🐾', SPORTS: '⚽',
  COMEDY: '😂', MOTIVATION: '🧠', DIY: '🛠️', AUTOMOTIVE: '🚗',
};

export const CONTENT_TYPES = [
  'REELS', 'LONG_FORM_VIDEO', 'STATIC_POSTS', 'STORIES',
  'BLOG_ARTICLES', 'PODCASTS', 'LIVE_STREAMS', 'PRODUCT_REVIEWS', 'TUTORIALS',
] as const;

export const CONTENT_TYPE_LABELS: Record<typeof CONTENT_TYPES[number], string> = {
  REELS: 'Reels / Short Videos',
  LONG_FORM_VIDEO: 'Long-form Videos',
  STATIC_POSTS: 'Static Posts',
  STORIES: 'Stories',
  BLOG_ARTICLES: 'Blog Articles',
  PODCASTS: 'Podcasts',
  LIVE_STREAMS: 'Live Streams',
  PRODUCT_REVIEWS: 'Product Reviews',
  TUTORIALS: 'Tutorials / How-to',
};

export const RATE_RANGES = [
  'RATE_1K_5K', 'RATE_5K_20K', 'RATE_20K_50K', 'RATE_50K_1L',
  'RATE_1L_5L', 'RATE_5L_PLUS', 'OPEN_TO_NEGOTIATE',
] as const;

export const RATE_RANGE_LABELS: Record<typeof RATE_RANGES[number], string> = {
  RATE_1K_5K: '₹1K – ₹5K',
  RATE_5K_20K: '₹5K – ₹20K',
  RATE_20K_50K: '₹20K – ₹50K',
  RATE_50K_1L: '₹50K – ₹1L',
  RATE_1L_5L: '₹1L – ₹5L',
  RATE_5L_PLUS: '₹5L+',
  OPEN_TO_NEGOTIATE: 'Open to negotiate',
};

export const COLLABORATION_TYPES = [
  'PAID_CAMPAIGNS', 'PRODUCT_EXCHANGE', 'AFFILIATE',
  'BRAND_AMBASSADOR', 'EVENT_APPEARANCES', 'HYBRID',
] as const;

export const COLLABORATION_TYPE_LABELS: Record<typeof COLLABORATION_TYPES[number], string> = {
  PAID_CAMPAIGNS: 'Paid Campaigns',
  PRODUCT_EXCHANGE: 'Product Exchange / Barter',
  AFFILIATE: 'Affiliate / Commission',
  BRAND_AMBASSADOR: 'Brand Ambassador (Long-term)',
  EVENT_APPEARANCES: 'Event Appearances',
  HYBRID: 'Hybrid',
};

export const AVAILABILITY_OPTIONS = [
  'IMMEDIATELY', 'ONE_TWO_WEEKS', 'ONE_MONTH', 'NOT_AVAILABLE',
] as const;

export const AVAILABILITY_LABELS: Record<typeof AVAILABILITY_OPTIONS[number], string> = {
  IMMEDIATELY: 'Available immediately',
  ONE_TWO_WEEKS: 'Available in 1-2 weeks',
  ONE_MONTH: 'Available in 1 month',
  NOT_AVAILABLE: 'Currently not available',
};

export const TRAVEL_SCOPES = [
  'WITHIN_CITY', 'WITHIN_STATE', 'ANYWHERE_INDIA', 'INTERNATIONAL',
] as const;

export const TRAVEL_SCOPE_LABELS: Record<typeof TRAVEL_SCOPES[number], string> = {
  WITHIN_CITY: 'Within city',
  WITHIN_STATE: 'Within state',
  ANYWHERE_INDIA: 'Anywhere in India',
  INTERNATIONAL: 'International',
};

export const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Other',
] as const;

export const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Prefer not to say',
] as const;

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter/X',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
  BLOG: 'Blog/Website',
};

export interface SocialAccountFormData {
  platform: SocialPlatform;
  profileUrl: string;
  handle: string;
  followerCount: number;
  accountType?: string;
}

export interface CreatorFormData {
  // Step 1
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender?: string;
  profileImageUrl?: string;
  // Step 2
  socialAccounts: SocialAccountFormData[];
  // Step 3
  categories: CreatorCategory[];
  bio: string;
  languages: string[];
  city: string;
  state: string;
  country: string;
  contentTypes: string[];
  portfolioUrl?: string;
  // Step 4
  rateRange: string;
  collaborationTypes: string[];
  availability: string;
  willingToTravel: boolean;
  travelScope?: string;
  previousCollaborations?: number;
  notableBrands: string[];
  // Step 5
  termsOfService: boolean;
  contentGuidelines: boolean;
  ageConfirmation: boolean;
  dataAccuracy: boolean;
  marketingEmails: boolean;
  whatsappNotifications: boolean;
}
```

**Step 2: Create agency form types**

```typescript
// frontend/src/types/agency.types.ts

export const INDUSTRY_CATEGORIES = [
  'FASHION_APPAREL', 'FOOD_BEVERAGE', 'TECHNOLOGY_ELECTRONICS',
  'FINANCE_FINTECH', 'TRAVEL_HOSPITALITY', 'BEAUTY_PERSONAL_CARE',
  'FITNESS_SPORTS', 'GAMING_ENTERTAINMENT', 'EDUCATION_EDTECH',
  'HEALTH_PHARMA', 'AUTOMOTIVE', 'REAL_ESTATE', 'D2C_ECOMMERCE', 'OTHER',
] as const;

export const INDUSTRY_LABELS: Record<typeof INDUSTRY_CATEGORIES[number], string> = {
  FASHION_APPAREL: 'Fashion & Apparel',
  FOOD_BEVERAGE: 'Food & Beverage',
  TECHNOLOGY_ELECTRONICS: 'Technology & Electronics',
  FINANCE_FINTECH: 'Finance & Fintech',
  TRAVEL_HOSPITALITY: 'Travel & Hospitality',
  BEAUTY_PERSONAL_CARE: 'Beauty & Personal Care',
  FITNESS_SPORTS: 'Fitness & Sports',
  GAMING_ENTERTAINMENT: 'Gaming & Entertainment',
  EDUCATION_EDTECH: 'Education & EdTech',
  HEALTH_PHARMA: 'Health & Pharma',
  AUTOMOTIVE: 'Automotive',
  REAL_ESTATE: 'Real Estate',
  D2C_ECOMMERCE: 'D2C / E-commerce',
  OTHER: 'Other',
};

export const COMPANY_SIZES = [
  'SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500_PLUS',
] as const;

export const COMPANY_SIZE_LABELS: Record<typeof COMPANY_SIZES[number], string> = {
  SIZE_1_10: '1-10',
  SIZE_11_50: '11-50',
  SIZE_51_200: '51-200',
  SIZE_201_500: '201-500',
  SIZE_500_PLUS: '500+',
};

export const BUDGET_RANGES = [
  'BUDGET_5K_20K', 'BUDGET_20K_1L', 'BUDGET_1L_5L', 'BUDGET_5L_PLUS', 'VARIES',
] as const;

export const BUDGET_RANGE_LABELS: Record<typeof BUDGET_RANGES[number], string> = {
  BUDGET_5K_20K: '₹5,000 – ₹20,000 per creator',
  BUDGET_20K_1L: '₹20,000 – ₹1,00,000 per creator',
  BUDGET_1L_5L: '₹1,00,000 – ₹5,00,000 per creator',
  BUDGET_5L_PLUS: '₹5,00,000+ per creator',
  VARIES: 'Varies by campaign',
};

export const PAYMENT_TYPES = [
  'FIXED', 'AFFILIATE', 'PRODUCT_EXCHANGE', 'HYBRID', 'PERFORMANCE_BASED',
] as const;

export const PAYMENT_TYPE_LABELS: Record<typeof PAYMENT_TYPES[number], string> = {
  FIXED: 'Fixed Payment',
  AFFILIATE: 'Affiliate / Commission-based',
  PRODUCT_EXCHANGE: 'Product Exchange / Barter',
  HYBRID: 'Hybrid (Fixed + Commission)',
  PERFORMANCE_BASED: 'Performance-based (CPV/CPE)',
};

export const PAYMENT_TIMELINES = [
  'UPFRONT', 'ON_DELIVERY', 'FIFTEEN_DAYS', 'THIRTY_DAYS', 'MILESTONE_BASED',
] as const;

export const PAYMENT_TIMELINE_LABELS: Record<typeof PAYMENT_TIMELINES[number], string> = {
  UPFRONT: 'Upfront (before content)',
  ON_DELIVERY: 'On delivery',
  FIFTEEN_DAYS: '15 days after delivery',
  THIRTY_DAYS: '30 days after delivery',
  MILESTONE_BASED: 'Milestone-based',
};

export const FOLLOWER_RANGES = [
  'NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA', 'ANY',
] as const;

export const FOLLOWER_RANGE_LABELS: Record<typeof FOLLOWER_RANGES[number], string> = {
  NANO: 'Nano (1K-10K)',
  MICRO: 'Micro (10K-50K)',
  MID_TIER: 'Mid-tier (50K-500K)',
  MACRO: 'Macro (500K-1M)',
  MEGA: 'Mega (1M+)',
  ANY: 'Any',
};

export const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'] as const;

export const TARGET_GENDERS = ['Male', 'Female', 'All Genders'] as const;

export const TARGET_LOCATIONS = [
  'Pan India', 'Metro cities only', 'Tier 1 cities', 'Tier 2 cities',
  'Specific states', 'International',
] as const;

export const INCOME_BRACKETS = [
  'Budget-conscious', 'Mid-range', 'Premium', 'Luxury',
] as const;

export const CAMPAIGNS_PER_MONTH = [
  '1-2', '3-5', '6-10', '10+', 'Seasonal / As needed',
] as const;

export const PREFERRED_PLATFORMS = [
  'Instagram', 'YouTube', 'TikTok', 'Twitter/X', 'Facebook',
  'LinkedIn', 'Blog / Written Content', 'Podcast',
] as const;

export const CONTENT_TYPES_AGENCY = [
  'Reels / Short Videos', 'Long-form Videos', 'Static Image Posts',
  'Stories (24hr)', 'Carousel Posts', 'Blog Articles / Reviews',
  'Live Streams', 'Podcast Mentions', 'Unboxing Videos', 'Tutorial / How-to Content',
] as const;

export interface AgencyFormData {
  // Step 1: Account Manager
  fullName: string;
  workEmail: string;
  password: string;
  confirmPassword: string;
  phone: string;
  designation: string;
  linkedinUrl?: string;
  // Step 2: Brand Details
  brandName: string;
  companyLegalName: string;
  website: string;
  brandLogo?: string;
  industry: string;
  companySize: string;
  yearFounded?: number;
  gstin?: string;
  description: string;
  brandSocials: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  // Step 3: Location & Target Audience
  country: string;
  state: string;
  city: string;
  pinCode?: string;
  targetAgeGroups: string[];
  targetGenders: string[];
  targetLocations: string[];
  targetIncomeBracket?: string;
  targetLanguages: string[];
  // Step 4: Campaign Preferences
  preferredPlatforms: string[];
  contentTypesNeeded: string[];
  budgetRange: string;
  paymentTypes: string[];
  paymentTimeline: string;
  campaignsPerMonth?: string;
  preferredFollowerRange: string[];
  preferredCreatorCategories: string[];
  // Step 5: Terms
  termsOfService: boolean;
  brandGuidelines: boolean;
  paymentTerms: boolean;
  dataAccuracy: boolean;
  creatorCommunicationPolicy: boolean;
  marketingEmails: boolean;
}
```

**Step 3: Verify no TypeScript errors**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

---

### Task 10: Create Zod Validation Schemas

**Files:**
- Create: `frontend/src/schemas/creatorSignupSchema.ts`
- Create: `frontend/src/schemas/agencySignupSchema.ts`

**Step 1: Create creator schemas (one per step + combined)**

```typescript
// frontend/src/schemas/creatorSignupSchema.ts
import { z } from 'zod';

export const creatorStep1Schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters').max(50).regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  lastName: z.string().min(2, 'Min 2 characters').max(50).regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  displayName: z.string().min(3, 'Min 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscores only'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Min 10 digits').max(15, 'Max 15 digits'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  profileImageUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const socialAccountSchema = z.object({
  platform: z.string().min(1, 'Select a platform'),
  profileUrl: z.string().url('Must be a valid URL'),
  handle: z.string().min(2, 'Min 2 characters').max(50),
  followerCount: z.number({ coerce: true }).min(0, 'Must be 0 or more'),
  accountType: z.string().optional(),
});

export const creatorStep2Schema = z.object({
  socialAccounts: z.array(socialAccountSchema).min(1, 'At least one social account is required'),
});

export const creatorStep3Schema = z.object({
  categories: z.array(z.string()).min(1, 'Select at least 1').max(3, 'Max 3 categories'),
  bio: z.string().min(50, 'Min 50 characters').max(500, 'Max 500 characters'),
  languages: z.array(z.string()).min(1, 'Select at least 1 language'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  contentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export const creatorStep4Schema = z.object({
  rateRange: z.string().min(1, 'Select a rate range'),
  collaborationTypes: z.array(z.string()).min(1, 'Select at least 1'),
  availability: z.string().min(1, 'Select availability'),
  willingToTravel: z.boolean(),
  travelScope: z.string().optional(),
  previousCollaborations: z.number({ coerce: true }).min(0).optional(),
  notableBrands: z.array(z.string()),
});

export const creatorStep5Schema = z.object({
  termsOfService: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms of Service' }) }),
  contentGuidelines: z.literal(true, { errorMap: () => ({ message: 'You must accept Content Guidelines' }) }),
  ageConfirmation: z.literal(true, { errorMap: () => ({ message: 'You must confirm your age' }) }),
  dataAccuracy: z.literal(true, { errorMap: () => ({ message: 'You must confirm data accuracy' }) }),
  marketingEmails: z.boolean(),
  whatsappNotifications: z.boolean(),
});

export const creatorStepSchemas = [
  creatorStep1Schema,
  creatorStep2Schema,
  creatorStep3Schema,
  creatorStep4Schema,
  creatorStep5Schema,
];

export const creatorFullSchema = z.object({
  ...creatorStep1Schema._def.schema.shape,
  ...creatorStep2Schema.shape,
  ...creatorStep3Schema.shape,
  ...creatorStep4Schema.shape,
  ...creatorStep5Schema.shape,
});
```

Note: `creatorStep1Schema` uses `.refine()` so it becomes a `ZodEffects`. The step schemas array handles this. For the combined schema, we manually merge the shapes and add the refinement.

**Step 2: Create agency schemas**

```typescript
// frontend/src/schemas/agencySignupSchema.ts
import { z } from 'zod';

export const agencyStep1Schema = z.object({
  fullName: z.string().min(2, 'Min 2 characters').max(100),
  workEmail: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
  phone: z.string().min(10).max(15),
  designation: z.string().min(2, 'Min 2 characters').max(50),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const agencyStep2Schema = z.object({
  brandName: z.string().min(2).max(100),
  companyLegalName: z.string().min(2).max(150),
  website: z.string().url('Must be a valid URL'),
  brandLogo: z.string().optional(),
  industry: z.string().min(1, 'Select an industry'),
  companySize: z.string().min(1, 'Select company size'),
  yearFounded: z.number({ coerce: true }).min(1900).max(2026).optional(),
  gstin: z.string().optional(),
  description: z.string().min(50, 'Min 50 characters').max(500),
  brandSocials: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }),
});

export const agencyStep3Schema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  pinCode: z.string().optional(),
  targetAgeGroups: z.array(z.string()).min(1, 'Select at least 1'),
  targetGenders: z.array(z.string()).min(1, 'Select at least 1'),
  targetLocations: z.array(z.string()).min(1, 'Select at least 1'),
  targetIncomeBracket: z.string().optional(),
  targetLanguages: z.array(z.string()).min(1, 'Select at least 1'),
});

export const agencyStep4Schema = z.object({
  preferredPlatforms: z.array(z.string()).min(1, 'Select at least 1'),
  contentTypesNeeded: z.array(z.string()).min(1, 'Select at least 1'),
  budgetRange: z.string().min(1, 'Select a budget range'),
  paymentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  paymentTimeline: z.string().min(1, 'Select payment timeline'),
  campaignsPerMonth: z.string().optional(),
  preferredFollowerRange: z.array(z.string()).min(1, 'Select at least 1'),
  preferredCreatorCategories: z.array(z.string()).min(1, 'Select at least 1').max(5, 'Max 5'),
});

export const agencyStep5Schema = z.object({
  termsOfService: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  brandGuidelines: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  paymentTerms: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  dataAccuracy: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  creatorCommunicationPolicy: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  marketingEmails: z.boolean(),
});

export const agencyStepSchemas = [
  agencyStep1Schema,
  agencyStep2Schema,
  agencyStep3Schema,
  agencyStep4Schema,
  agencyStep5Schema,
];
```

---

### Task 11: Create API Endpoint Functions

**Files:**
- Rewrite: `frontend/src/api/endpoints.ts`

**Step 1: Write endpoint functions**

```typescript
// frontend/src/api/endpoints.ts
import apiClient from './axios';
import type { CreatorFormData } from '../types/creator.types';
import type { AgencyFormData } from '../types/agency.types';

export async function registerCreator(data: CreatorFormData) {
  const { confirmPassword, termsOfService, contentGuidelines, ageConfirmation, dataAccuracy, ...payload } = data;
  const { data: result } = await apiClient.post('/auth/register/creator', payload);
  return result;
}

export async function registerAgency(data: AgencyFormData) {
  const {
    confirmPassword, termsOfService, brandGuidelines, paymentTerms,
    dataAccuracy, creatorCommunicationPolicy, brandLogo,
    targetAgeGroups, targetGenders, targetLocations, targetIncomeBracket, targetLanguages,
    preferredPlatforms, contentTypesNeeded, budgetRange, paymentTypes, paymentTimeline,
    campaignsPerMonth, preferredFollowerRange, preferredCreatorCategories,
    ...rest
  } = data;

  const payload = {
    ...rest,
    targetAudience: {
      ageGroups: targetAgeGroups,
      genders: targetGenders,
      locations: targetLocations,
      incomeBracket: targetIncomeBracket,
      languages: targetLanguages,
    },
    campaignPreferences: {
      platforms: preferredPlatforms,
      contentTypes: contentTypesNeeded,
      budgetRange,
      paymentTypes,
      paymentTimeline,
      campaignsPerMonth,
      preferredFollowerRange,
      preferredCreatorCategories,
    },
    logoUrl: brandLogo,
  };

  const { data: result } = await apiClient.post('/auth/register/agency', payload);
  return result;
}

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get(`/auth/check-username/${encodeURIComponent(username)}`);
  return data;
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get(`/auth/check-email/${encodeURIComponent(email)}`);
  return data;
}
```

**Step 2: Commit types, schemas, and API**

```bash
cd frontend
git add src/types/ src/schemas/ src/api/endpoints.ts
git commit -m "feat(frontend): add signup form types, Zod schemas, and API endpoints"
```

---

## Phase 3: Frontend Shared Components

---

### Task 12: Create ProgressBar Component

**Files:**
- Create: `frontend/src/pages/signup/components/ProgressBar.tsx`

**Step 1: Write the component**

```tsx
// frontend/src/pages/signup/components/ProgressBar.tsx
import { cn } from '../../../lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick: (step: number) => void;
}

export function ProgressBar({ currentStep, totalSteps, stepLabels, onStepClick }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => i < currentStep && onStepClick(i)}
              disabled={i > currentStep}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shrink-0',
                i < currentStep && 'bg-purple-600 text-white cursor-pointer hover:bg-purple-700',
                i === currentStep && 'bg-blue-500 text-white ring-4 ring-blue-200 scale-110',
                i > currentStep && 'bg-gray-200 text-gray-500 cursor-not-allowed',
              )}
            >
              {i < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </button>
            {i < totalSteps - 1 && (
              <div className={cn(
                'h-1 flex-1 mx-2 rounded transition-all duration-300',
                i < currentStep ? 'bg-purple-600' : 'bg-gray-200',
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, i) => (
          <span
            key={i}
            className={cn(
              'text-xs text-center',
              i <= currentStep ? 'text-purple-600 font-medium' : 'text-gray-400',
              i === 0 && 'text-left',
              i === totalSteps - 1 && 'text-right',
            )}
            style={{ width: `${100 / totalSteps}%` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 13: Create StepNavigator Component

**Files:**
- Create: `frontend/src/pages/signup/components/StepNavigator.tsx`

**Step 1: Write the component**

```tsx
// frontend/src/pages/signup/components/StepNavigator.tsx
import { cn } from '../../../lib/utils';

interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function StepNavigator({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  submitLabel = 'Create Account',
}: StepNavigatorProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition"
        >
          ← Back
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={cn(
          'px-8 py-2.5 rounded-xl font-medium transition flex items-center gap-2',
          'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : isLastStep ? (
          <>{submitLabel} ✓</>
        ) : (
          <>Next →</>
        )}
      </button>
    </div>
  );
}
```

---

### Task 14: Create Shared Form Components

**Files:**
- Create: `frontend/src/pages/signup/components/shared/PasswordStrengthMeter.tsx`
- Create: `frontend/src/pages/signup/components/shared/ChipMultiSelect.tsx`
- Create: `frontend/src/pages/signup/components/shared/CategorySelector.tsx`
- Create: `frontend/src/pages/signup/components/shared/PhoneInput.tsx`
- Create: `frontend/src/pages/signup/components/shared/ImageUpload.tsx`
- Create: `frontend/src/pages/signup/components/shared/SocialAccountEntry.tsx`
- Create: `frontend/src/pages/signup/components/shared/TermsAccordion.tsx`
- Create: `frontend/src/pages/signup/components/shared/TermsCheckboxGroup.tsx`

This task is large. Each component should be implemented as described in the spec. Key implementation notes:

**PasswordStrengthMeter.tsx:**
- Takes `password: string` prop
- Computes strength: weak (red), medium (yellow), strong (green)
- Rules: length >= 8, has uppercase, has lowercase, has number, has special char
- Display colored bar + label

**ChipMultiSelect.tsx:**
- Generic chip selector: `items`, `selected`, `onChange`, `maxSelections?`
- Renders as pill buttons, selected = purple border + filled
- Shake animation if trying to exceed max

**CategorySelector.tsx:**
- Grid of cards (4 cols desktop, 2 mobile) with icon + label
- Uses `ChipMultiSelect` pattern but card-based
- Max 3 selections for creator categories

**PhoneInput.tsx:**
- Country code dropdown (default +91) + number input
- Simple implementation, no library

**ImageUpload.tsx:**
- File input with drag-and-drop zone
- Preview as circle (for profile photo) or square (for logo)
- Max 5MB, JPG/PNG/WEBP validation
- No crop — just preview

**SocialAccountEntry.tsx:**
- Single social account card with platform dropdown, URL, handle, follower count
- Platform-specific icon/color
- Remove button (disabled if only 1 entry)

**TermsAccordion.tsx:**
- Collapsible sections showing terms text
- Click to expand/collapse with smooth animation

**TermsCheckboxGroup.tsx:**
- List of labeled checkboxes, some required some optional
- Required ones show error if unchecked on submit

Each component should be self-contained with clear props interface. Implement them one at a time.

---

### Task 15: Commit Shared Components

```bash
cd frontend
git add src/pages/signup/components/
git commit -m "feat(frontend): add signup shared components (ProgressBar, StepNavigator, form primitives)"
```

---

## Phase 4: Creator Signup Wizard

---

### Task 16: Create Creator Step Components

**Files:**
- Create: `frontend/src/pages/signup/components/creator/PersonalInfoStep.tsx`
- Create: `frontend/src/pages/signup/components/creator/SocialMediaStep.tsx`
- Create: `frontend/src/pages/signup/components/creator/ProfileCategoriesStep.tsx`
- Create: `frontend/src/pages/signup/components/creator/CollaborationPrefsStep.tsx`
- Create: `frontend/src/pages/signup/components/creator/CreatorReviewStep.tsx`

Each step component receives `UseFormReturn<CreatorFormData>` as props (the shared form instance).

**PersonalInfoStep:** Fields from spec Step 1 — firstName, lastName, displayName (with availability check), email (with availability check), phone, password + confirm + strength meter, dateOfBirth (day/month/year dropdowns), gender, profile photo upload.

**SocialMediaStep:** Dynamic list of `SocialAccountEntry` components. "Add Another" button. Min 1 required. Total follower count badge.

**ProfileCategoriesStep:** CategorySelector for categories (max 3), bio textarea with char counter, language chips, location fields (city/state/country), contentType chips, portfolioUrl.

**CollaborationPrefsStep:** Rate range dropdown, collaboration type chips, availability dropdown, willing to travel toggle + scope dropdown, previous collaborations number, notable brands tag input.

**CreatorReviewStep:** Profile preview card, TermsAccordion with creator terms, TermsCheckboxGroup with required/optional checkboxes.

Each component follows the floating label input pattern, uses `register()` and `formState.errors` from react-hook-form, and styles with Tailwind per the spec's visual guidelines.

---

### Task 17: Build CreatorSignup Wizard Wrapper

**Files:**
- Rewrite: `frontend/src/pages/signup/CreatorSignup.tsx`

**Step 1: Implement the wizard**

```tsx
// frontend/src/pages/signup/CreatorSignup.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './components/ProgressBar';
import { StepNavigator } from './components/StepNavigator';
import { PersonalInfoStep } from './components/creator/PersonalInfoStep';
import { SocialMediaStep } from './components/creator/SocialMediaStep';
import { ProfileCategoriesStep } from './components/creator/ProfileCategoriesStep';
import { CollaborationPrefsStep } from './components/creator/CollaborationPrefsStep';
import { CreatorReviewStep } from './components/creator/CreatorReviewStep';
import { creatorStepSchemas } from '../../schemas/creatorSignupSchema';
import { registerCreator } from '../../api/endpoints';
import type { CreatorFormData } from '../../types/creator.types';

const STEP_LABELS = ['Personal', 'Social', 'Profile', 'Collab', 'Review'];

const STEP_FIELDS: (keyof CreatorFormData)[][] = [
  ['firstName', 'lastName', 'displayName', 'email', 'phone', 'password', 'confirmPassword', 'dateOfBirth', 'gender'],
  ['socialAccounts'],
  ['categories', 'bio', 'languages', 'city', 'state', 'country', 'contentTypes', 'portfolioUrl'],
  ['rateRange', 'collaborationTypes', 'availability', 'willingToTravel', 'travelScope', 'previousCollaborations', 'notableBrands'],
  ['termsOfService', 'contentGuidelines', 'ageConfirmation', 'dataAccuracy', 'marketingEmails', 'whatsappNotifications'],
];

export function CreatorSignup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CreatorFormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '', lastName: '', displayName: '', email: '', phone: '',
      password: '', confirmPassword: '', dateOfBirth: '', gender: '',
      socialAccounts: [{ platform: '' as any, profileUrl: '', handle: '', followerCount: 0 }],
      categories: [], bio: '', languages: [], city: '', state: '', country: 'India',
      contentTypes: [], portfolioUrl: '',
      rateRange: '', collaborationTypes: [], availability: '',
      willingToTravel: false, travelScope: '', previousCollaborations: undefined,
      notableBrands: [],
      termsOfService: false, contentGuidelines: false, ageConfirmation: false,
      dataAccuracy: false, marketingEmails: true, whatsappNotifications: false,
    },
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    const schema = creatorStepSchemas[currentStep];
    const fields = STEP_FIELDS[currentStep];
    const values: Record<string, any> = {};
    fields.forEach((f) => { values[f] = form.getValues(f); });

    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join('.') as any;
        form.setError(path, { message: err.message });
      });
      toast.error(`Please fix ${result.error.errors.length} error(s) below`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (currentStep === 4) {
      setIsSubmitting(true);
      try {
        await registerCreator(form.getValues());
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => navigate('/signup/verify-email'), 2000);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const steps = [
    <PersonalInfoStep form={form} />,
    <SocialMediaStep form={form} />,
    <ProfileCategoriesStep form={form} />,
    <CollaborationPrefsStep form={form} />,
    <CreatorReviewStep form={form} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={5}
          stepLabels={STEP_LABELS}
          onStepClick={(step) => { setDirection(step < currentStep ? -1 : 1); setCurrentStep(step); }}
        />

        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ x: direction * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {steps[currentStep]}
            </motion.div>
          </AnimatePresence>

          <StepNavigator
            currentStep={currentStep}
            totalSteps={5}
            onBack={handleBack}
            onNext={handleNext}
            isSubmitting={isSubmitting}
            submitLabel="Create My Creator Account"
          />
        </div>
      </div>
    </div>
  );
}
```

---

### Task 18: Commit Creator Signup

```bash
cd frontend
git add src/pages/signup/
git commit -m "feat(frontend): implement creator signup 5-step wizard"
```

---

## Phase 5: Agency Signup Wizard

---

### Task 19: Create Agency Step Components

**Files:**
- Create: `frontend/src/pages/signup/components/agency/AccountManagerStep.tsx`
- Create: `frontend/src/pages/signup/components/agency/BrandDetailsStep.tsx`
- Create: `frontend/src/pages/signup/components/agency/LocationAudienceStep.tsx`
- Create: `frontend/src/pages/signup/components/agency/CampaignPrefsStep.tsx`
- Create: `frontend/src/pages/signup/components/agency/AgencyReviewStep.tsx`

Mirror the creator pattern. Each receives `UseFormReturn<AgencyFormData>`.

**AccountManagerStep:** fullName, workEmail, password + confirm + strength, phone, designation, linkedinUrl.

**BrandDetailsStep:** brandName, companyLegalName, website, logo upload, industry dropdown, companySize dropdown, yearFounded, gstin, description textarea, brand socials (collapsible URL fields).

**LocationAudienceStep:** Country/state/city/pin fields + target audience chips (age groups, genders, locations, income, languages).

**CampaignPrefsStep:** Platform chips, content type chips, budget dropdown, payment type chips, payment timeline dropdown, campaigns per month, follower range chips, creator category chips.

**AgencyReviewStep:** Brand profile preview card, terms accordion, terms checkboxes.

---

### Task 20: Build AgencySignup Wizard Wrapper

**Files:**
- Rewrite: `frontend/src/pages/signup/AgencySignup.tsx`

Same pattern as `CreatorSignup.tsx` but using agency schemas, agency form data, agency step components, and calling `registerAgency`. Submit label: "Launch My Brand on CollabHub".

---

### Task 21: Commit Agency Signup

```bash
cd frontend
git add src/pages/signup/
git commit -m "feat(frontend): implement agency signup 5-step wizard"
```

---

## Phase 6: Email Verification Page & Route

---

### Task 22: Create EmailVerification Page

**Files:**
- Create: `frontend/src/pages/signup/EmailVerification.tsx`
- Modify: `frontend/src/App.tsx` (add route)

**Step 1: Write the page**

```tsx
// frontend/src/pages/signup/EmailVerification.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function EmailVerification() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    // TODO: call resend email API
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white px-4">
      <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address.
        </p>
        <button
          onClick={handleResend}
          disabled={!canResend}
          className="w-full py-2.5 px-4 rounded-xl font-medium transition bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
        </button>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-sm text-purple-600 hover:underline"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Add route to App.tsx**

Add import: `import { EmailVerification } from './pages/signup/EmailVerification'`

Add route after the agency signup route:
```tsx
<Route path="/signup/verify-email" element={<EmailVerification />} />
```

**Step 3: Commit**

```bash
git add frontend/src/pages/signup/EmailVerification.tsx frontend/src/App.tsx
git commit -m "feat(frontend): add email verification page and route"
```

---

## Phase 7: Final Integration & Testing

---

### Task 23: Install Frontend Dependencies and Verify Build

**Step 1: Install packages**

Run: `cd frontend && npm install`
Expected: No errors

**Step 2: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Verify dev server starts**

Run: `cd frontend && npm run dev`
Expected: Vite dev server starts on port 5173

---

### Task 24: Verify Backend Compilation

**Step 1: Verify build**

Run: `cd backend && npm run build`
Expected: Build completes successfully

**Step 2: Run existing tests**

Run: `cd backend && npm test`
Expected: All existing tests pass (may need to update test mocks for new DTO shapes)

---

### Task 25: Update Backend Tests for New DTOs

**Files:**
- Modify any existing auth tests that reference old DTO fields

If `auth.service.spec.ts` or `auth.controller.spec.ts` exist, update mock data to match new DTO shapes (add firstName, lastName, displayName, dateOfBirth, bio, languages, city, state, country, categories, contentTypes, rateRange, collaborationTypes, availability, socialAccounts).

---

### Task 26: Final Commit

```bash
git add -A
git commit -m "feat: complete signup forms implementation (creator + agency 5-step wizards)"
```

---

## Task Dependency Summary

```
Phase 1 (Backend): Tasks 1-7 (sequential)
Phase 2 (Types/Schemas): Tasks 8-11 (sequential, depends on Phase 1 for enum alignment)
Phase 3 (Shared Components): Tasks 12-15 (parallelizable per component)
Phase 4 (Creator Wizard): Tasks 16-18 (depends on Phase 3)
Phase 5 (Agency Wizard): Tasks 19-21 (depends on Phase 3, parallel with Phase 4)
Phase 6 (Email Verification): Task 22 (independent)
Phase 7 (Integration): Tasks 23-26 (depends on all above)
```

Phases 4 and 5 can be parallelized. Phase 6 is independent and can run anytime.
