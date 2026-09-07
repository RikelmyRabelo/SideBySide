-- Store the client session identifier so rating retries are idempotent.
ALTER TABLE "ConversationSession" ADD COLUMN "clientSessionId" TEXT;
CREATE UNIQUE INDEX "ConversationSession_clientSessionId_key"
ON "ConversationSession"("clientSessionId");
