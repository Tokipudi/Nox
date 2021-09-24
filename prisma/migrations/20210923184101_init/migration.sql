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
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "lastClaimDate" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Players_pkey" PRIMARY KEY ("userId","guildId")
);

-- CreateTable
CREATE TABLE "Guilds" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayersSkins" (
    "guildId" TEXT NOT NULL,
    "skinId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "isExhausted" BOOLEAN DEFAULT false,
    "exhaustChangeDate" TIMESTAMP(3),

    CONSTRAINT "PlayersSkins_pkey" PRIMARY KEY ("guildId","skinId")
);

-- CreateTable
CREATE TABLE "PlayersWishedSkins" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "skinId" INTEGER NOT NULL,

    CONSTRAINT "PlayersWishedSkins_pkey" PRIMARY KEY ("userId","guildId","skinId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gods_name_key" ON "Gods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pantheons_name_key" ON "Pantheons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkinsObtainability_name_key" ON "SkinsObtainability"("name");

-- AddForeignKey
ALTER TABLE "Gods" ADD CONSTRAINT "Gods_pantheonId_fkey" FOREIGN KEY ("pantheonId") REFERENCES "Pantheons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skins" ADD CONSTRAINT "Skins_godId_fkey" FOREIGN KEY ("godId") REFERENCES "Gods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skins" ADD CONSTRAINT "Skins_obtainabilityId_fkey" FOREIGN KEY ("obtainabilityId") REFERENCES "SkinsObtainability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Players" ADD CONSTRAINT "Players_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guilds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSkins" ADD CONSTRAINT "PlayersSkins_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersSkins" ADD CONSTRAINT "PlayersSkins_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "Players"("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersWishedSkins" ADD CONSTRAINT "PlayersWishedSkins_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "Players"("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersWishedSkins" ADD CONSTRAINT "PlayersWishedSkins_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
