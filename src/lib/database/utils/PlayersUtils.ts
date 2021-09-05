import { container } from '@sapphire/framework';

export async function deleteAllPlayers() {
    return await container.prisma.players.deleteMany();
}