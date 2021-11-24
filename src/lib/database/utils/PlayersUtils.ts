import { container } from '@sapphire/framework';
import { Snowflake } from 'discord-api-types';
import moment from 'moment';

export async function createPlayer(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.create({
        data: {
            user: {
                connectOrCreate: {
                    create: {
                        id: userId,
                        guilds: {
                            connectOrCreate: {
                                create: {
                                    id: guildId
                                },
                                where: {
                                    id: guildId
                                }
                            }
                        }
                    },
                    where: {
                        id: userId
                    }
                }
            },
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
            claimsAvailable: 1,
            rollsAvailable: 3
        }
    });
}

export async function getPlayerByUserId(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.players.findFirst({
        include: {
            playersSkins: {
                include: {
                    skin: true
                }
            },
            wishedSkins: true,
            user: true,
            guild: true
        },
        where: {
            user: {
                id: userId
            },
            guild: {
                id: guildId
            }
        }
    });
}

export async function getPlayer(playerId: number) {
    return await container.prisma.players.findUnique({
        where: {
            id: playerId
        },
        include: {
            playersSkins: {
                include: {
                    skin: true
                }
            },
            wishedSkins: true,
            user: true,
            guild: true
        }
    });
}

export async function setFavoriteSkin(playerId: number, skinId: number) {
    await container.prisma.playersSkins.updateMany({
        data: {
            isFavorite: false
        },
        where: {
            player: {
                id: playerId
            }
        }
    });
    return await container.prisma.playersSkins.update({
        data: {
            isFavorite: true
        },
        where: {
            playerId_skinId: {
                playerId: playerId,
                skinId: skinId
            }
        }
    });
}

export async function addRoll(playerId: number) {
    return await container.prisma.players.update({
        data: {
            rolls: {
                increment: 1
            }
        },
        where: {
            id: playerId
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
export async function setPlayerAsBanned(playerId: number, duration: number = 0) {
    let banEndDate = null;
    if (duration > 0) {
        banEndDate = moment.utc().add(duration, 'minutes').toDate();
    }
    return await container.prisma.players.update({
        data: {
            isBanned: true,
            banStartDate: moment.utc().toDate(),
            banEndDate: banEndDate,
            banCount: {
                increment: 1
            }
        },
        where: {
            id: playerId
        }
    });
}

export async function substractAvailableRolls(playerId: number, rollsToSubstract: number = 1) {
    let player = await container.prisma.players.update({
        data: {
            rollsAvailable: {
                decrement: rollsToSubstract
            }
        },
        where: {
            id: playerId
        }
    });

    if (player.lastRollChangeDate == null || moment.utc().isAfter(moment(player.lastRollChangeDate).add(1, 'hour'))) {
        player = await container.prisma.players.update({
            data: {
                lastRollChangeDate: moment.utc().toDate()
            },
            where: {
                id: playerId
            }
        });
    }

    return player;
}

export async function canPlayerRoll(playerId: number) {
    const player = await getPlayer(playerId);
    if (player) {
        return !player.isBanned && player.rollsAvailable > 0;
    }
    return true;
}

export async function canPlayerClaimRoll(playerId: number) {
    const player = await getPlayer(playerId);
    if (player) {
        return !player.isBanned && player.claimsAvailable > 0;
    }
    return true;
}

export async function getTimeLeftBeforeRoll(playerId: number) {
    const player = await getPlayer(playerId);

    const now = moment().unix();
    const rollDate = moment(player.lastRollChangeDate).add(1, 'hour').unix();
    const timeLeft = rollDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}

export async function getTimeLeftBeforeClaim(playerId: number) {
    const player = await getPlayer(playerId);

    const now = moment().unix();
    const claimableDate = moment(player.lastClaimChangeDate).add(3, 'hours').unix();
    const timeLeft = claimableDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}