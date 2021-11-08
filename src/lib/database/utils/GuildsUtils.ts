import { container } from "@sapphire/pieces";
import { Snowflake } from "discord-api-types";
import { archivePlayersByGuildId } from "./PlayersUtils";

export async function getGuilds() {
    return await container.prisma.guilds.findMany();
}

export async function startNewSeason(guildId: Snowflake) {
    await archivePlayersByGuildId(guildId);

    return await container.prisma.guilds.update({
        data: {
            season: {
                increment: 1
            }
        },
        where: {
            id: guildId
        }
    });
}