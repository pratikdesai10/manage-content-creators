/*
  Warnings:

  - The values [TECH,BEAUTY,OTHER] on the enum `CreatorCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `companyRegistration` on the `AgencyProfile` table. All the data in the column will be lost.
  - You are about to drop the column `productCategory` on the `AgencyProfile` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `CreatorProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[displayName]` on the table `CreatorProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[creatorProfileId,platform]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.
  - Made the column `designation` on table `AgencyContact` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `campaignPreferences` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyLegalName` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companySize` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetAudience` to the `AgencyProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `website` on table `AgencyProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `AgencyProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `availability` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rateRange` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `CreatorProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `bio` on table `CreatorProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REELS', 'LONG_FORM_VIDEO', 'STATIC_POSTS', 'STORIES', 'BLOG_ARTICLES', 'PODCASTS', 'LIVE_STREAMS', 'PRODUCT_REVIEWS', 'TUTORIALS');

-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('PAID_CAMPAIGNS', 'PRODUCT_EXCHANGE', 'AFFILIATE', 'BRAND_AMBASSADOR', 'EVENT_APPEARANCES', 'HYBRID');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('IMMEDIATELY', 'ONE_TWO_WEEKS', 'ONE_MONTH', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "TravelScope" AS ENUM ('WITHIN_CITY', 'WITHIN_STATE', 'ANYWHERE_INDIA', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "RateRange" AS ENUM ('RATE_1K_5K', 'RATE_5K_20K', 'RATE_20K_50K', 'RATE_50K_1L', 'RATE_1L_5L', 'RATE_5L_PLUS', 'OPEN_TO_NEGOTIATE');

-- CreateEnum
CREATE TYPE "IndustryCategory" AS ENUM ('FASHION_APPAREL', 'FOOD_BEVERAGE', 'TECHNOLOGY_ELECTRONICS', 'FINANCE_FINTECH', 'TRAVEL_HOSPITALITY', 'BEAUTY_PERSONAL_CARE', 'FITNESS_SPORTS', 'GAMING_ENTERTAINMENT', 'EDUCATION_EDTECH', 'HEALTH_PHARMA', 'AUTOMOTIVE', 'REAL_ESTATE', 'D2C_ECOMMERCE', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500_PLUS');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('BUDGET_5K_20K', 'BUDGET_20K_1L', 'BUDGET_1L_5L', 'BUDGET_5L_PLUS', 'VARIES');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FIXED', 'AFFILIATE', 'PRODUCT_EXCHANGE', 'HYBRID', 'PERFORMANCE_BASED');

-- CreateEnum
CREATE TYPE "PaymentTimeline" AS ENUM ('UPFRONT', 'ON_DELIVERY', 'FIFTEEN_DAYS', 'THIRTY_DAYS', 'MILESTONE_BASED');

-- CreateEnum
CREATE TYPE "FollowerRange" AS ENUM ('NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA', 'ANY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SocialPlatform" ADD VALUE 'LINKEDIN';
ALTER TYPE "SocialPlatform" ADD VALUE 'BLOG';

-- AlterTable
ALTER TABLE "AgencyContact" ADD COLUMN     "linkedinUrl" TEXT,
ALTER COLUMN "designation" SET NOT NULL;

-- AlterTable
ALTER TABLE "AgencyProfile" DROP COLUMN "companyRegistration",
DROP COLUMN "productCategory",
ADD COLUMN     "brandSocials" JSONB,
ADD COLUMN     "campaignPreferences" JSONB NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "companyLegalName" TEXT NOT NULL,
ADD COLUMN     "companySize" "CompanySize" NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "industry" "IndustryCategory" NOT NULL,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "targetAudience" JSONB NOT NULL,
ADD COLUMN     "yearFounded" INTEGER,
ALTER COLUMN "website" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable: drop old columns and add new ones (categories added as old CreatorCategory type first)
ALTER TABLE "CreatorProfile" DROP COLUMN "age",
DROP COLUMN "category",
ADD COLUMN     "availability" "Availability" NOT NULL,
ADD COLUMN     "categories" "CreatorCategory"[],
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "collaborationTypes" "CollaborationType"[],
ADD COLUMN     "contentTypes" "ContentType"[],
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notableBrands" TEXT[],
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "previousCollaborations" INTEGER,
ADD COLUMN     "rateRange" "RateRange" NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "travelScope" "TravelScope",
ADD COLUMN     "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "bio" SET NOT NULL;

-- AlterEnum: now that categories column exists, replace CreatorCategory enum
BEGIN;
CREATE TYPE "CreatorCategory_new" AS ENUM ('ENTERTAINMENT', 'EDUCATION', 'FINANCE', 'TECHNOLOGY', 'LIFESTYLE', 'FITNESS', 'TRAVEL', 'FOOD', 'FASHION', 'GAMING', 'MUSIC', 'PHOTOGRAPHY', 'AI_TOOLS', 'PARENTING', 'PETS', 'SPORTS', 'COMEDY', 'MOTIVATION', 'DIY', 'AUTOMOTIVE');
ALTER TABLE "CreatorProfile" ALTER COLUMN "categories" TYPE "CreatorCategory_new"[] USING ("categories"::text::"CreatorCategory_new"[]);
ALTER TYPE "CreatorCategory" RENAME TO "CreatorCategory_old";
ALTER TYPE "CreatorCategory_new" RENAME TO "CreatorCategory";
DROP TYPE "CreatorCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "accountType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- DropEnum
DROP TYPE "AgencyProductCategory";

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandLogo" TEXT,
    "type" "CollaborationType" NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_displayName_key" ON "CreatorProfile"("displayName");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_creatorProfileId_platform_key" ON "SocialAccount"("creatorProfileId", "platform");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
