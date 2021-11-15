import { container } from '@sapphire/framework';
import { Snowflake } from 'discord-api-types';
import moment from 'moment';

export async function getPlayers(guildId: Snowflake) {
    return await container.prisma.players.findMany({
        include: {
            guild: true,
            playersSkins: true
        },
        where: {
            guild: {
                id: guildId
            }
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

export async function substractAvailableClaims(userId: Snowflake, guildId: Snowflake, claimsToSubstract: number = 1) {
    let player = await container.prisma.players.update({
        data: {
            claimsAvailable: {
                decrement: claimsToSubstract
            }
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });

    if (player.lastClaimChangeDate == null || moment.utc().isAfter(moment(player.lastClaimChangeDate).add(3, 'hour'))) {
        player = await container.prisma.players.update({
            data: {
                lastClaimChangeDate: moment.utc().toDate()
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });
    }

    return player;
}

export async function addAvailableClaims(userId: Snowflake, guildId: Snowflake, claimsToAdd: number = 1) {
    let player = await container.prisma.players.update({
        data: {
            claimsAvailable: {
                increment: claimsToAdd
            }
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });

    if (player.lastClaimChangeDate == null || (moment.utc().isAfter(moment(player.lastClaimChangeDate).add(3, 'hour')))) {
        player = await container.prisma.players.update({
            data: {
                lastClaimChangeDate: moment.utc().toDate()
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });
    }

    return player;
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

export async function substractAvailableRolls(userId: Snowflake, guildId: Snowflake, rollsToSubstract: number = 1) {
    let player = await container.prisma.players.update({
        data: {
            rollsAvailable: {
                decrement: rollsToSubstract
            }
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });

    if (player.lastRollChangeDate == null || moment.utc().isAfter(moment(player.lastRollChangeDate).add(1, 'hour'))) {
        player = await container.prisma.players.update({
            data: {
                lastRollChangeDate: moment.utc().toDate()
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });
    }

    return player;
}

export async function addAvailableRolls(userId: Snowflake, guildId: Snowflake, rollsToAdd: number = 1) {
    let player = await container.prisma.players.update({
        data: {
            rollsAvailable: {
                increment: rollsToAdd
            }
        },
        where: {
            userId_guildId: {
                userId: userId,
                guildId: guildId
            }
        }
    });

    if (player.lastRollChangeDate == null || moment.utc().isAfter(moment(player.lastRollChangeDate).add(1, 'hour'))) {
        player = await container.prisma.players.update({
            data: {
                lastRollChangeDate: moment.utc().toDate()
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });
    }

    return player;
}

export async function canPlayerClaimRoll(userId: Snowflake, guildId: Snowflake) {
    const player = await getPlayer(userId, guildId);
    if (player) {
        return !player.isBanned && (!player || player.claimsAvailable > 0);
    }
    return true;
}

export async function getTimeLeftBeforeRoll(userId: Snowflake, guildId: Snowflake) {
    const player = await getPlayer(userId, guildId);

    const now = moment().unix();
    const rollDate = moment(player.lastRollChangeDate).add(1, 'hour').unix();
    const timeLeft = rollDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}

export async function getTimeLeftBeforeClaim(userId: Snowflake, guildId: Snowflake) {
    const player = await getPlayer(userId, guildId);

    const now = moment().unix();
    const claimableDate = moment(player.lastClaimChangeDate).add(3, 'hours').unix();
    const timeLeft = claimableDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}