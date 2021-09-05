import { container } from '@sapphire/framework';

export async function getPlayerById(id: string) {
    return await container.prisma.players.findUnique({
        where: {
            id: id
        }
    });
}

export async function setPlayerAsNewById(id: string) {
    return await container.prisma.players.update({
        data: {
            isNew: true
        },
        where: {
            id: id
        }
    });
}

export async function setPlayerAsBannedById(id: string) {
    return await container.prisma.players.update({
        data: {
            isBanned: true
        },
        where: {
            id: id
        }
    });
}

export async function deleteAllPlayers() {
    return await container.prisma.players.deleteMany();
}