-- CreateTable
CREATE TABLE "Commands" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Commands_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "GuildsCommands" (
    "guildId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "authorizedChannelIds" TEXT[],

    CONSTRAINT "GuildsCommands_pkey" PRIMARY KEY ("guildId","commandName")
);

-- AddForeignKey
ALTER TABLE "GuildsCommands" ADD CONSTRAINT "GuildsCommands_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guilds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildsCommands" ADD CONSTRAINT "GuildsCommands_commandName_fkey" FOREIGN KEY ("commandName") REFERENCES "Commands"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
