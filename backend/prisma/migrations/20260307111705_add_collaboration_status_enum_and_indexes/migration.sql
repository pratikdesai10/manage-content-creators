/*
  Warnings:

  - Changed the type of `status` on the `Collaboration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Collaboration" DROP COLUMN "status",
ADD COLUMN     "status" "CollaborationStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "Collaboration_creatorId_idx" ON "Collaboration"("creatorId");

-- CreateIndex
CREATE INDEX "Message_creatorId_idx" ON "Message"("creatorId");
