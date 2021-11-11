import { container } from '@sapphire/framework';
import { Snowflake } from 'discord-api-types';
import moment from 'moment';
import { resetAllSkinsByGuildId } from './SkinsUtils';

export async function getPlayers() {
    return await container.prisma.players.findMany({
        include: {
            guild: true,
            playersSkins: true
        }
    });
}

export async function getPlayer(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.findUnique({
        include: {
            playersSkins: {
                include: {
                    skin: true
                }
            },
            wishedSkins: true
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });
}

export async function SetFavoriteSkin(skinId: number, userId: Snowflake, guildId: Snowflake) {
    await container.prisma.playersSkins.updateMany({
        data: {
            isFavorite: false
        },
        where: {
            player: {
                userId: userId,
                guild: {
                    id: guildId
                }
            }
        }
    });
    return await container.prisma.playersSkins.update({
        data: {
            isFavorite: true
        },
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId
            }
        }
    });
}

export async function addRoll(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.update({
        data: {
            rolls: {
                increment: 1
            }
        },
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

/**
 * 
 * @param userId 
 * @param guildId 
 * @param duration in minutes 
 * @returns 
 */
export async function setPlayerAsBanned(userId: Snowflake, guildId: Snowflake, duration: number = 0) {
    let banEndDate = null;
    if (duration > 0) {
        banEndDate = moment.utc().add(duration, 'minutes').toDate();
    }
    return await container.prisma.players.upsert({
        update: {
            isBanned: true,
            banStartDate: moment.utc().toDate(),
            banEndDate: banEndDate,
            banCount: {
                increment: 1
            }
        },
        create: {
            userId: userId,
            guild: {
                connectOrCreate: {
                    create: {
                        id: guildId
                    },
                    where: {
                        id: guildId
                    }
                }
            },
            banCount: 1,
            isBanned: true,
            banStartDate: moment.utc().toDate(),
            banEndDate: banEndDate
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });
}

export async function setPlayerAsUnbanned(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.update({
        data: {
            isBanned: false,
            banStartDate: null,
            banEndDate: null
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });
}

export async function getBannedPlayersByGuildId(guildId: Snowflake) {
    return await container.prisma.players.findMany({
        where: {
            isBanned: true,
            banEndDate: {
                not: null
            },
            guild: {
                id: guildId
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