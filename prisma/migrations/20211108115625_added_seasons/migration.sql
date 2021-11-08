-- AlterTable
ALTER TABLE "Guilds" ADD COLUMN     "season" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Players" ADD COLUMN     "rolls" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PlayersSeasonsArchive" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "claimedCards" INTEGER NOT NULL DEFAULT 0,
    "win" INTEGER NOT NULL DEFAULT 0,
    "loss" INTEGER NOT NULL DEFAULT 0,
    "highestWinningStreak" INTEGER NOT NULL DEFAULT 0,
    "highestLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "favoriteSkinId" INTEGER,
    "rolls" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayersSeasonsArchive_pkey" PRIMARY KEY ("userId","guildId","season")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSeasonsAchievements" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,

    CONSTRAINT "PlayerSeasonsAchievements_pkey" PRIMARY KEY ("userId","guildId","season","achievementId")
);

-- AddForeignKey
ALTER TABLE "PlayersSeasonsArchive" ADD CONSTRAINT "PlayersSeasonsArchive_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "Players"("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSeasonsArchive" ADD CONSTRAINT "PlayersSeasonsArchive_favoriteSkinId_fkey" FOREIGN KEY ("favoriteSkinId") REFERENCES "Skins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeasonsAchievements" ADD CONSTRAINT "PlayerSeasonsAchievements_userId_guildId_season_fkey" FOREIGN KEY ("userId", "guildId", "season") REFERENCES "PlayersSeasonsArchive"("userId", "guildId", "season") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeasonsAchievements" ADD CONSTRAINT "PlayerSeasonsAchievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
