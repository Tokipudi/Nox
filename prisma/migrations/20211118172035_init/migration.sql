-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guilds" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gods" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pantheonId" INTEGER NOT NULL,
    "roles" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lore" TEXT NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "autoBanned" BOOLEAN NOT NULL DEFAULT false,
    "onFreeRotation" BOOLEAN NOT NULL DEFAULT false,
    "latestGod" BOOLEAN NOT NULL DEFAULT false,
    "ability1" TEXT NOT NULL,
    "ability2" TEXT NOT NULL,
    "ability3" TEXT NOT NULL,
    "ability4" TEXT NOT NULL,
    "ability5" TEXT NOT NULL,
    "abilityThumbnail1" TEXT NOT NULL,
    "abilityThumbnail2" TEXT NOT NULL,
    "abilityThumbnail3" TEXT NOT NULL,
    "abilityThumbnail4" TEXT NOT NULL,
    "abilityThumbnail5" TEXT NOT NULL,
    "basicAttack" TEXT NOT NULL,
    "attackSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "AttackSpeedPerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hp5PerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 0,
    "healthPerLevel" INTEGER NOT NULL DEFAULT 0,
    "mp5PerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "magicProtection" INTEGER NOT NULL DEFAULT 0,
    "magicProtectionPerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "magicalPower" INTEGER NOT NULL DEFAULT 0,
    "magicalPowerPerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mana" INTEGER NOT NULL DEFAULT 0,
    "manaPerFive" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "manaPerLevel" INTEGER NOT NULL DEFAULT 0,
    "physicalPower" INTEGER NOT NULL DEFAULT 0,
    "physicalPowerPerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "physicalProtection" INTEGER NOT NULL DEFAULT 0,
    "physicalProtectionPerLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "godCardUrl" TEXT,
    "godIconUrl" TEXT NOT NULL,

    CONSTRAINT "Gods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pantheons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Pantheons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skins" (
    "id" INTEGER NOT NULL,
    "godId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "godIconUrl" TEXT NOT NULL,
    "godSkinUrl" TEXT NOT NULL,
    "obtainabilityId" INTEGER,
    "priceFavor" INTEGER NOT NULL DEFAULT 0,
    "priceGems" INTEGER NOT NULL DEFAULT 0,
    "releaseDate" TIMESTAMP(3),

    CONSTRAINT "Skins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinsObtainability" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SkinsObtainability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Players" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "rollsAvailable" INTEGER NOT NULL DEFAULT 3,
    "lastRollChangeDate" TIMESTAMP(3),
    "claimsAvailable" INTEGER NOT NULL DEFAULT 1,
    "lastClaimChangeDate" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banStartDate" TIMESTAMP(3),
    "banEndDate" TIMESTAMP(3),
    "banCount" INTEGER NOT NULL DEFAULT 0,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "win" INTEGER NOT NULL DEFAULT 0,
    "loss" INTEGER NOT NULL DEFAULT 0,
    "winningStreak" INTEGER NOT NULL DEFAULT 0,
    "losingStreak" INTEGER NOT NULL DEFAULT 0,
    "highestWinningStreak" INTEGER NOT NULL DEFAULT 0,
    "highestLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "rolls" INTEGER NOT NULL DEFAULT 0,
    "claimedCards" INTEGER NOT NULL DEFAULT 0,
    "cardsGiven" INTEGER NOT NULL DEFAULT 0,
    "cardsExchanged" INTEGER NOT NULL DEFAULT 0,
    "cardsStolen" INTEGER NOT NULL DEFAULT 0,
    "cardsReceived" INTEGER NOT NULL DEFAULT 0,
    "allInWins" INTEGER NOT NULL DEFAULT 0,
    "allInLoss" INTEGER NOT NULL DEFAULT 0,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "tokens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayersSeasonsArchive" (
    "playerId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "win" INTEGER NOT NULL DEFAULT 0,
    "loss" INTEGER NOT NULL DEFAULT 0,
    "highestWinningStreak" INTEGER NOT NULL DEFAULT 0,
    "highestLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "rolls" INTEGER NOT NULL DEFAULT 0,
    "claimedCards" INTEGER NOT NULL DEFAULT 0,
    "cardsGiven" INTEGER NOT NULL DEFAULT 0,
    "cardsExchanged" INTEGER NOT NULL DEFAULT 0,
    "cardsStolen" INTEGER NOT NULL DEFAULT 0,
    "cardsReceived" INTEGER NOT NULL DEFAULT 0,
    "allInWins" INTEGER NOT NULL DEFAULT 0,
    "allInLoss" INTEGER NOT NULL DEFAULT 0,
    "favoriteSkinId" INTEGER,

    CONSTRAINT "PlayersSeasonsArchive_pkey" PRIMARY KEY ("playerId","season")
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
CREATE TABLE "PlayersSeasonsAchievements" (
    "playerId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,

    CONSTRAINT "PlayersSeasonsAchievements_pkey" PRIMARY KEY ("playerId","season","achievementId")
);

-- CreateTable
CREATE TABLE "PlayersSkins" (
    "playerId" INTEGER NOT NULL,
    "skinId" INTEGER NOT NULL,
    "isExhausted" BOOLEAN DEFAULT false,
    "exhaustChangeDate" TIMESTAMP(3),
    "win" INTEGER NOT NULL DEFAULT 0,
    "loss" INTEGER NOT NULL DEFAULT 0,
    "winningStreak" INTEGER NOT NULL DEFAULT 0,
    "losingStreak" INTEGER NOT NULL DEFAULT 0,
    "highestWinningStreak" INTEGER NOT NULL DEFAULT 0,
    "highestLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayersSkins_pkey" PRIMARY KEY ("playerId","skinId")
);

-- CreateTable
CREATE TABLE "PlayersWishedSkins" (
    "playerId" INTEGER NOT NULL,
    "skinId" INTEGER NOT NULL,

    CONSTRAINT "PlayersWishedSkins_pkey" PRIMARY KEY ("playerId","skinId")
);

-- CreateTable
CREATE TABLE "_GuildsToUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Gods_name_key" ON "Gods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pantheons_name_key" ON "Pantheons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkinsObtainability_name_key" ON "SkinsObtainability"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_name_key" ON "Achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_GuildsToUsers_AB_unique" ON "_GuildsToUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_GuildsToUsers_B_index" ON "_GuildsToUsers"("B");

-- AddForeignKey
ALTER TABLE "Gods" ADD CONSTRAINT "Gods_pantheonId_fkey" FOREIGN KEY ("pantheonId") REFERENCES "Pantheons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skins" ADD CONSTRAINT "Skins_godId_fkey" FOREIGN KEY ("godId") REFERENCES "Gods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skins" ADD CONSTRAINT "Skins_obtainabilityId_fkey" FOREIGN KEY ("obtainabilityId") REFERENCES "SkinsObtainability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Players" ADD CONSTRAINT "Players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Players" ADD CONSTRAINT "Players_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guilds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSeasonsArchive" ADD CONSTRAINT "PlayersSeasonsArchive_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSeasonsArchive" ADD CONSTRAINT "PlayersSeasonsArchive_favoriteSkinId_fkey" FOREIGN KEY ("favoriteSkinId") REFERENCES "Skins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSeasonsAchievements" ADD CONSTRAINT "PlayersSeasonsAchievements_playerId_season_fkey" FOREIGN KEY ("playerId", "season") REFERENCES "PlayersSeasonsArchive"("playerId", "season") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSeasonsAchievements" ADD CONSTRAINT "PlayersSeasonsAchievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSkins" ADD CONSTRAINT "PlayersSkins_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSkins" ADD CONSTRAINT "PlayersSkins_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersWishedSkins" ADD CONSTRAINT "PlayersWishedSkins_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersWishedSkins" ADD CONSTRAINT "PlayersWishedSkins_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuildsToUsers" ADD FOREIGN KEY ("A") REFERENCES "Guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuildsToUsers" ADD FOREIGN KEY ("B") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
