CREATE TYPE "UserLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE "FlagStatus" AS ENUM ('CLEAN', 'WARNING', 'SUSPENDED', 'BANNED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

ALTER TABLE "User" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "level" TYPE "UserLevel" USING upper("level")::"UserLevel";
ALTER TABLE "User" ALTER COLUMN "level" SET DEFAULT 'B1';

ALTER TABLE "User" ALTER COLUMN "flagStatus" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "flagStatus" TYPE "FlagStatus" USING upper("flagStatus")::"FlagStatus";
ALTER TABLE "User" ALTER COLUMN "flagStatus" SET DEFAULT 'CLEAN';

ALTER TABLE "Report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "status" TYPE "ReportStatus" USING upper("status")::"ReportStatus";
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'OPEN';

ALTER TABLE "FriendRelation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FriendRelation" ALTER COLUMN "status" TYPE "FriendshipStatus" USING upper("status")::"FriendshipStatus";
ALTER TABLE "FriendRelation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
