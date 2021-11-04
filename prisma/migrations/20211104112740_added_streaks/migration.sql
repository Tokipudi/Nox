-- AlterTable
ALTER TABLE "Players" ADD COLUMN     "losingStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winningStreak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlayersSkins" ADD COLUMN     "losingStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winningStreak" INTEGER NOT NULL DEFAULT 0;
