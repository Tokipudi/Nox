import { container } from "@sapphire/pieces";
import { Snowflake } from "discord.js";

export async function getGuilds() {
    return await container.prisma.guilds.findMany();
}

export async function getGuildById(guildId: Snowflake) {
    return await container.prisma.guilds.findUnique({
        where: {
            id: guildId
        }
    });
}

export async function isGuildActive(guildId: Snowflake): Promise<boolean> {
    return (await container.prisma.guilds.findUnique({
        where: {
            id: guildId
        }
    })).isActive;
}

export async function setGuildActive(guildId: Snowflake) {
    return await container.prisma.guilds.update({
        data: {
            isActive: true
        },
        where: {
            id: guildId
        }
    });
}

export async function setGuildInactive(guildId: Snowflake) {
    return await container.prisma.guilds.update({
        data: {
            isActive: false
        },
        where: {
            id: guildId
        }
    });
}