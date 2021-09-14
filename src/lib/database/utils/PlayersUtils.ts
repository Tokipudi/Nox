import { container } from '@sapphire/framework';
import moment from 'moment';

export async function disconnectSkinById(playerId: string, skinId: number) {
    return await container.prisma.players.update({
        data: {
            skins: {
                disconnect: {
                    id: skinId
                }
            }
        },
        where: {
            id: playerId
        }
    });
}

export async function getPlayerById(id: string) {
    return await container.prisma.players.findUnique({
        where: {
            id: id
        }
    });
}

export async function resetLastClaimDate(id: string) {
    return await container.prisma.players.update({
        data: {
            lastClaimDate: null
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

export async function canPlayerClaimRoll(playerId: string) {
    const player = await getPlayerById(playerId);
    if (player) {
        return (!player || !player.lastClaimDate || moment.utc().isSameOrAfter(moment(player.lastClaimDate).add(3, 'hour'))) && !player.isBanned;
    }
    return true;
}

export async function getTimeLeftBeforeClaim(playerId: string) {
    const player = await getPlayerById(playerId);
    
    const now = moment().unix();
    const claimableDate = moment(player.lastClaimDate).add(3, 'hours').unix();
    const timeLeft = claimableDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}