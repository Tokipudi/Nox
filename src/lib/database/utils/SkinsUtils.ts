import { container } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Snowflake } from 'discord-api-types';
import moment from 'moment';

export async function getSkins() {
    return await container.prisma.skins.findMany({
        include: {
            god: {
                select: {
                    name: true
                }
            },
            obtainability: true
        }
    });
}

export async function getSkinById(skinId: number, guildId: Snowflake) {
    return await container.prisma.skins.findFirst({
        where: {
            id: skinId,
            playersSkins: {
                some: {
                    guildId: guildId
                }
            }
        },
        include: {
            playersSkins: {
                include: {
                    player: true
                }
            },
            playersWishes: true
        }
    });
}

export async function getSkinsByObtainability(obtainability: string, guildId: Snowflake) {
    return await container.prisma.skins.findMany({
        include: {
            playersSkins: {
                where: {
                    guildId: guildId
                }
            }
        },
        where: {
            obtainability: {
                name: obtainability
            }
        }
    });
}

export async function connectSkin(skinId: number, userId: Snowflake, guildId: Snowflake, updateLastClaimDate: boolean = true) {
    const skin = await container.prisma.skins.update({
        data: {
            playersSkins: {
                connectOrCreate: {
                    create: {
                        player: {
                            connectOrCreate: {
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
                                    }
                                },
                                where: {
                                    userId_guildId: {
                                        userId: userId,
                                        guildId: guildId
                                    }
                                }
                            }
                        }
                    },
                    where: {
                        guildId_skinId: {
                            guildId: guildId,
                            skinId: skinId
                        }
                    }
                }
            }
        },
        where: {
            id: skinId
        }
    });

    if (updateLastClaimDate) {
        await container.prisma.players.update({
            data: {
                lastClaimDate: moment.utc().toDate()
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });
    }

    return skin;
}

export async function disconnectSkin(skinId: number, guildId: Snowflake) {
    return await container.prisma.skins.update({
        data: {
            playersSkins: {
                delete: {
                    guildId_skinId: {
                        guildId: guildId,
                        skinId: skinId
                    }
                }
            }
        },
        where: {
            id: skinId
        }
    });
}

export async function getSkinsByUser(userId: Snowflake, guildId: Snowflake) {
    const skins = await container.prisma.skins.findMany({
        where: {
            playersSkins: {
                some: {
                    userId: userId,
                    guildId: guildId
                }
            }
        },
        include: {
            god: {
                select: {
                    name: true
                }
            },
            obtainability: {
                select: {
                    name: true
                }
            },
            playersSkins: {
                select: {
                    isExhausted: true,
                    isFavorite: true,
                    win: true,
                    loss: true,
                    winningStreak: true,
                    highestWinningStreak: true,
                    losingStreak: true,
                    highestLosingStreak: true
                },
                where: {
                    userId: userId,
                    guildId: guildId
                }
            }
        },
        orderBy: {
            god: {
                name: 'asc'
            }
        }
    });
    for (let i = 0; i < skins.length; i++) {
        const skin = skins[i];
        if (skin.playersSkins[0].isFavorite) {
            skins.splice(i, 1);
            skins.unshift(skin);
            break;
        }
    }
    return skins;
}

export async function getSkinByGodName(godName: string, skinName: string) {
    return await container.prisma.skins.findFirst({
        where: {
            god: {
                name: toTitleCase(godName)
            },
            name: toTitleCase(skinName)
        },
        include: {
            god: {
                select: {
                    name: true
                }
            },
            obtainability: {
                select: {
                    name: true
                }
            }
        }
    });
}

export async function getSkinsByGodName(name: string) {
    return await container.prisma.skins.findMany({
        where: {
            god: {
                name: name
            },
            obtainability: {
                isNot: null
            }
        },
        include: {
            god: {
                select: {
                    name: true
                }
            },
            obtainability: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            releaseDate: 'desc'
        }
    });
}

export async function getUnclaimedSkinsByGuildId(guildId: Snowflake) {
    return await container.prisma.skins.count({
        where: {

        }
    })
}

export async function exchangeSkins(userId1: Snowflake, skinId1: number, userId2: Snowflake, skinId2: number, guildId: Snowflake, updateLastClaimDate: boolean = true) {
    await container.prisma.playersSkins.update({
        data: {
            userId: userId2
        },
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId1
            }
        }
    });

    await container.prisma.playersSkins.update({
        data: {
            userId: userId1
        },
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId2
            }
        }
    });

    await container.prisma.players.update({
        data: {
            cardsExchanged: {
                increment: 1
            }
        },
        where: {
            userId_guildId: {
                userId: userId1,
                guildId: guildId
            }
        }
    });

    await container.prisma.players.update({
        data: {
            cardsExchanged: {
                increment: 1
            }
        },
        where: {
            userId_guildId: {
                userId: userId2,
                guildId: guildId
            }
        }
    });
}

export async function giveSkin(userId: Snowflake, guildId: Snowflake, skinId: number, updateLastClaimDate: boolean = true) {
    const skin = await getSkinById(skinId, guildId);
    await disconnectSkin(skinId, guildId);

    const newSkin = await connectSkin(skinId, userId, guildId, updateLastClaimDate);

    await container.prisma.players.update({
        data: {
            cardsGiven: {
                increment: 1
            }
        },
        where: {
            userId_guildId: {
                userId: skin.playersSkins[0].userId,
                guildId: guildId
            }
        }
    });

    await container.prisma.players.update({
        data: {
            cardsReceived: {
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

    if (!skin.playersSkins[0].isExhausted) {
        return newSkin;
    }

    await container.prisma.playersSkins.update({
        data: {
            isExhausted: true,
            exhaustChangeDate: skin.playersSkins[0].exhaustChangeDate
        },
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId
            }
        }
    });

    return await getSkinById(skinId, guildId);
}

export async function getSkinWishlist(userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.skins.findMany({
        where: {
            playersWishes: {
                some: {
                    userId: userId,
                    guildId: guildId
                }
            }
        },
        include: {
            god: {
                select: {
                    name: true
                }
            },
            obtainability: {
                select: {
                    name: true
                }
            },
            playersSkins: {
                select: {
                    isExhausted: true
                },
                where: {
                    userId: userId,
                    guildId: guildId
                }
            }
        },
        orderBy: {
            god: {
                name: 'asc'
            }
        }
    });
}

export async function disconnectWishlistSkin(skinId: number, userId: Snowflake, guildId: Snowflake) {
    return await container.prisma.playersWishedSkins.delete({
        where: {
            userId_guildId_skinId: {
                userId: userId,
                guildId: guildId,
                skinId: skinId
            }
        }
    });
}

export async function addSkinToWishlist(userId: Snowflake, guildId: Snowflake, skinId: number) {
    return await container.prisma.playersWishedSkins.create({
        data: {
            player: {
                connectOrCreate: {
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
                        }
                    },
                    where: {
                        userId_guildId: {
                            userId: userId,
                            guildId: guildId
                        }
                    }
                }
            },
            skin: {
                connect: {
                    id: skinId
                }
            }
        }
    });
}

export async function getSkinOwner(skinId: number, guildId: Snowflake) {
    return await container.prisma.playersSkins.findUnique({
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId
            }
        }
    })
}

export async function addWin(skinId: number, guildId: Snowflake) {
    let playersSkin = await container.prisma.playersSkins.update({
        data: {
            win: {
                increment: 1
            },
            winningStreak: {
                increment: 1
            },
            losingStreak: 0
        },
        include: {
            player: true
        },
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId
            }
        }
    });

    if (playersSkin.winningStreak > playersSkin.highestWinningStreak) {
        playersSkin = await container.prisma.playersSkins.update({
            data: {
                highestWinningStreak: playersSkin.winningStreak
            },
            include: {
                player: true
            },
            where: {
                guildId_skinId: {
                    guildId: guildId,
                    skinId: skinId
                }
            }
        });
    }

    const player = await container.prisma.players.update({
        data: {
            winningStreak: {
                increment: 1
            },
            win: {
                increment: 1
            }
        },
        where: {
            userId_guildId: {
                guildId: guildId,
                userId: playersSkin.player.userId
            }
        }
    });

    if (player.losingStreak > player.highestLosingStreak) {
        await container.prisma.players.update({
            data: {
                highestWinningStreak: player.winningStreak
            },
            where: {
                userId_guildId: {
                    guildId: guildId,
                    userId: playersSkin.player.userId
                }
            }
        });
    }

    return playersSkin;
}

export async function addLoss(skinId: number, guildId: Snowflake) {
    let playersSkin = await container.prisma.playersSkins.update({
        data: {
            loss: {
                increment: 1
            },
            losingStreak: {
                increment: 1
            },
            winningStreak: 0
        },
        include: {
            player: true
        },
        where: {
            guildId_skinId: {
                guildId: guildId,
                skinId: skinId
            }
        }
    });

    if (playersSkin.losingStreak > playersSkin.highestLosingStreak) {
        playersSkin = await container.prisma.playersSkins.update({
            data: {
                highestLosingStreak: playersSkin.losingStreak
            },
            include: {
                player: true
            },
            where: {
                guildId_skinId: {
                    guildId: guildId,
                    skinId: skinId
                }
            }
        });
    }

    const player = await container.prisma.players.update({
        data: {
            losingStreak: {
                increment: 1
            },
            loss: {
                increment: 1
            }
        },
        where: {
            userId_guildId: {
                guildId: guildId,
                userId: playersSkin.player.userId
            }
        }
    });

    if (player.losingStreak > player.highestLosingStreak) {
        await container.prisma.players.update({
            data: {
                highestLosingStreak: player.losingStreak
            },
            where: {
                userId_guildId: {
                    guildId: guildId,
                    userId: playersSkin.player.userId
                }
            }
        });
    }

    return playersSkin;
}

export async function exhaustSkin(skinId: number, guildId: Snowflake) {
    return await container.prisma.skins.update({
        data: {
            playersSkins: {
                update: {
                    data: {
                        isExhausted: true,
                        exhaustChangeDate: moment.utc().toDate()
                    },
                    where: {
                        guildId_skinId: {
                            guildId: guildId,
                            skinId: skinId
                        }
                    }
                }
            }
        },
        where: {
            id: skinId
        }
    });
}

export async function unexhaustSkin(skinId: number, guildId: Snowflake) {
    return await container.prisma.skins.update({
        data: {
            playersSkins: {
                update: {
                    data: {
                        isExhausted: false,
                        exhaustChangeDate: moment.utc().toDate()
                    },
                    where: {
                        guildId_skinId: {
                            guildId: guildId,
                            skinId: skinId
                        }
                    }
                }
            }
        },
        where: {
            id: skinId
        }
    });
}

export async function resetAllSkinsByGuildId(guildId: Snowflake) {
    await container.prisma.playersSkins.deleteMany({
        where: {
            guildId: guildId
        }
    });
    await container.prisma.playersWishedSkins.deleteMany({
        where: {
            guildId: guildId
        }
    });
}

export async function getTimeLeftBeforeExhaustEnd(skinId: number, guildId: Snowflake) {
    const skin = await getSkinById(skinId, guildId);

    const now = moment().unix();
    const exhausteEndDate = moment(skin.playersSkins[0].exhaustChangeDate).add(6, 'hours').unix();
    const timeLeft = exhausteEndDate - now;
    return moment.duration(timeLeft * 1000, 'milliseconds');
}