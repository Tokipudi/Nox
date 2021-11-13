-- AlterTable
ALTER TABLE "Players" ADD COLUMN     "lastRollDate" TIMESTAMP(3),
ADD COLUMN     "rollsAvailable" INTEGER NOT NULL DEFAULT 3;
