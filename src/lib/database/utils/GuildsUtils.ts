import { container } from "@sapphire/pieces";

export async function getGuilds() {
    return await container.prisma.guilds.findMany();
}