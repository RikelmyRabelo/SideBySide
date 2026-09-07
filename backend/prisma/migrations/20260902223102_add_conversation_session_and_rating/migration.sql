/*
  Warnings:

  - You are about to drop the column `sessionsHistory` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tag]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnerAvatar" TEXT,
    "duration" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "partnerRating" INTEGER,
    "platformRating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- Preserve legacy JSON session history before removing the old column.
INSERT INTO "ConversationSession" ("id", "userId", "partnerId", "partnerName", "partnerAvatar", "duration", "topic", "createdAt")
SELECT
    md5(u."id" || ':' || ordinality::text) AS "id",
    u."id",
    COALESCE(NULLIF(entry->>'partnerId', ''), 'desconhecido'),
    COALESCE(NULLIF(entry->>'partnerName', ''), 'Estudante'),
    NULLIF(entry->>'partnerAvatar', ''),
    COALESCE(NULLIF(entry->>'duration', ''), '15 min'),
    COALESCE(NULLIF(entry->>'topic', ''), 'Bate-Papo Livre'),
    CURRENT_TIMESTAMP
FROM "User" u
CROSS JOIN LATERAL unnest(u."sessionsHistory") WITH ORDINALITY AS history(entry, ordinality)
WHERE u."sessionsHistory" IS NOT NULL;

INSERT INTO "Rating" ("id", "sessionId", "partnerRating", "platformRating", "comment", "createdAt")
SELECT
    md5(session."id" || ':rating'),
    session."id",
    CASE WHEN entry->>'partnerRating' ~ '^[0-9]+$' THEN (entry->>'partnerRating')::integer ELSE NULL END,
    CASE WHEN entry->>'platformRating' ~ '^[0-9]+$' THEN (entry->>'platformRating')::integer ELSE 3 END,
    NULLIF(entry->>'comment', ''),
    session."createdAt"
FROM "User" u
CROSS JOIN LATERAL unnest(u."sessionsHistory") WITH ORDINALITY AS history(entry, ordinality)
JOIN "ConversationSession" session
    ON session."id" = md5(u."id" || ':' || ordinality::text)
WHERE u."sessionsHistory" IS NOT NULL;

-- Remove the legacy representation only after the data has been copied.
ALTER TABLE "User" DROP COLUMN "sessionsHistory",
ADD COLUMN     "tag" TEXT NOT NULL DEFAULT 'User#0000';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRelation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationSession_userId_idx" ON "ConversationSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_sessionId_key" ON "Rating"("sessionId");

-- CreateIndex
CREATE INDEX "Rating_sessionId_idx" ON "Rating"("sessionId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "FriendRelation_userId_idx" ON "FriendRelation"("userId");

-- CreateIndex
CREATE INDEX "FriendRelation_friendId_idx" ON "FriendRelation"("friendId");

-- CreateIndex
CREATE INDEX "FriendRelation_status_idx" ON "FriendRelation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRelation_userId_friendId_key" ON "FriendRelation"("userId", "friendId");

-- CreateIndex
CREATE INDEX "DirectMessage_senderId_idx" ON "DirectMessage"("senderId");

-- CreateIndex
CREATE INDEX "DirectMessage_recipientId_idx" ON "DirectMessage"("recipientId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_tag_key" ON "User"("tag");

-- AddForeignKey
ALTER TABLE "ConversationSession" ADD CONSTRAINT "ConversationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConversationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRelation" ADD CONSTRAINT "FriendRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRelation" ADD CONSTRAINT "FriendRelation_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
