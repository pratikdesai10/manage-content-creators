-- DropIndex
DROP INDEX "Collaboration_creatorId_idx";

-- DropIndex
DROP INDEX "Message_creatorId_idx";

-- DropIndex
DROP INDEX "MessageThread_messageId_idx";

-- CreateIndex
CREATE INDEX "Collaboration_creatorId_createdAt_idx" ON "Collaboration"("creatorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_creatorId_createdAt_idx" ON "Message"("creatorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MessageThread_messageId_sentAt_idx" ON "MessageThread"("messageId", "sentAt");
