-- Prevent duplicate reports from the same reporter against the same user.
CREATE UNIQUE INDEX "Report_reporterId_reportedUserId_key"
ON "Report"("reporterId", "reportedUserId");
