-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "brief" TEXT,
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "deliverables" TEXT[],
ADD COLUMN     "timeline" TEXT;

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "avgLikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "growthPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "topContentType" TEXT;

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageThread_messageId_idx" ON "MessageThread"("messageId");

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
