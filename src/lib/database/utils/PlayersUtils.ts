import { container } from '@sapphire/framework';
import { Snowflake } from 'discord-api-types';
import moment from 'moment';

export async function getPlayer(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.findUnique({
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });
}

export async function resetLastClaimDate(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.update({
        data: {
            lastClaimDate: null
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });
}

export async function setPlayerAsBanned(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.update({
        data: {
            isBanned: true
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });
}

export async function deleteAllPlayersByGuildId(guildId: Snowflake) {
    return await container.prisma.players.deleteMany({
        where: {
            guild: {
                id: guildId
            }
        }
    });
}

export async function canPlayerClaimRoll(userId: Snowflake, guildId: Snowflake) {
    const player = await getPlayer(userId, guildId);
    if (player) {
        return (!player || !player.lastClaimDate || moment.utc().isSameOrAfter(moment(player.lastClaimDate).add(3, 'hour'))) && !player.isBanned;
    }
    return true;
}

export async function getTimeLeftBeforeClaim(userId: Snowflake, guildId: Snowflake) {
    const player = await getPlayer(userId, guildId);

    const now = moment().unix();
    const claimableDate = moment(player.lastClaimDate).add(3, 'hours').unix();
    const timeLeft = claimableDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}