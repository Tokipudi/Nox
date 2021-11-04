-- AlterTable
ALTER TABLE "Players" ADD COLUMN     "highestLosingStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highestWinningStreak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlayersSkins" ADD COLUMN     "highestLosingStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highestWinningStreak" INTEGER NOT NULL DEFAULT 0;
