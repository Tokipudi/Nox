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
                    player: {
                        guild: {
                            id: guildId
                        }
                    }
                }
            }
        },
        include: {
            playersSkins: {
                include: {
                    player: true
                }
            },
            playersWishes: true,
            god: true
        }
    });
}

export async function getSkinsByObtainability(obtainability: string, guildId: Snowflake) {
    return await container.prisma.skins.findMany({
        include: {
            playersSkins: {
                where: {
                    player: {
                        guild: {
                            id: guildId
                        }
                    }
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

export async function connectSkin(skinId: number, playerId: number, updatelastClaimChangeDate: boolean = true) {
    const skin = await container.prisma.skins.update({
        data: {
            playersSkins: {
                connectOrCreate: {
                    create: {
                        player: {
                            connect: {
                                id: playerId
                            }
                        }
                    },
                    where: {
                        playerId_skinId: {
                            playerId: playerId,
                            skinId: skinId
                        }
                    }
                }
            }
        },
        where: {
            id: skinId
        },
        include: {
            god: true
        }
    });

    if (updatelastClaimChangeDate) {
        await container.prisma.players.update({
            data: {
                lastClaimChangeDate: moment.utc().toDate()
            },
            where: {
                id: playerId
            }
        });
    }

    return skin;
}

export async function getSkinsByPlayer(playerId: number) {
    const skins = await container.prisma.skins.findMany({
        where: {
            playersSkins: {
                some: {
                    player: {
                        id: playerId
                    }
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
                where: {
                    player: {
                        id: playerId
                    }
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

export async function disconnectSkin(skinId: number, playerId: number) {
    return await container.prisma.skins.update({
        data: {
            playersSkins: {
                delete: {
                    playerId_skinId: {
                        playerId: playerId,
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

export async function getSkinsByGodId(godId: number) {
    return await container.prisma.skins.findMany({
        where: {
            god: {
                id: godId
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

export async function giveSkin(playerId: number, guildId: Snowflake, skinId: number, updatelastClaimChangeDate: boolean = true) {
    const skin = await getSkinById(skinId, guildId);
    await disconnectSkin(skinId, skin.playersSkins[0].player.id);

    const newSkin = await connectSkin(skinId, playerId, updatelastClaimChangeDate);

    await container.prisma.players.update({
        data: {
            cardsGiven: {
                increment: 1
            }
        },
        where: {
            id: skin.playersSkins[0].player.id
        }
    });

    await container.prisma.players.update({
        data: {
            cardsReceived: {
                increment: 1
            }
        },
        where: {
            id: playerId
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
            playerId_skinId: {
                playerId: playerId,
                skinId: skinId
            }
        }
    });

    return await getSkinById(skinId, guildId);
}

export async function getSkinWishlist(playerId: number) {
    return await container.prisma.skins.findMany({
        where: {
            playersWishes: {
                some: {
                    player: {
                        id: playerId
                    }
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
                    player: {
                        id: playerId
                    }
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

export async function disconnectWishlistSkin(skinId: number, playerId: number) {
    return await container.prisma.playersWishedSkins.delete({
        where: {
            playerId_skinId: {
                playerId: playerId,
                skinId: skinId
            }
        }
    });
}

export async function addSkinToWishlist(playerId: number, skinId: number) {
    return await container.prisma.playersWishedSkins.create({
        data: {
            player: {
                connect: {
                    id: playerId
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
    return await container.prisma.playersSkins.findFirst({
        where: {
            skin: {
                id: skinId
            },
            player: {
                guild: {
                    id: guildId
                }
            }
        },
        include: {
            player: {
                include: {
                    user: true
                }
            }
        }
    })
}

export async function addWin(skinId: number, playerId: number) {
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
            playerId_skinId: {
                playerId: playerId,
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
                playerId_skinId: {
                    playerId: playerId,
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
            },
            losingStreak: 0
        },
        where: {
            id: playerId
        }
    });

    if (player.winningStreak > player.highestWinningStreak) {
        await container.prisma.players.update({
            data: {
                highestWinningStreak: player.winningStreak
            },
            where: {
                id: playerId
            }
        });
    }

    return playersSkin;
}

export async function addLoss(skinId: number, playerId: number) {
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
            playerId_skinId: {
                playerId: playerId,
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
                playerId_skinId: {
                    playerId: playerId,
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
            },
            winningStreak: 0
        },
        where: {
            id: playerId
        }
    });

    if (player.losingStreak > player.highestLosingStreak) {
        await container.prisma.players.update({
            data: {
                highestLosingStreak: player.losingStreak
            },
            where: {
                id: playerId
            }
        });
    }

    return playersSkin;
}

export async function exhaustSkin(skinId: number, playerId: number) {
    return await container.prisma.playersSkins.update({
        data: {
            isExhausted: true,
            exhaustChangeDate: moment.utc().toDate()
        },
        where: {
            playerId_skinId: {
                playerId: playerId,
                skinId: skinId
            }
        }
    });
}

export async function resetAllSkinsByGuildId(guildId: Snowflake) {
    await container.prisma.playersSkins.deleteMany({
        where: {
            player: {
                guild: {
                    id: guildId
                }
            }
        }
    });
    await container.prisma.playersWishedSkins.deleteMany({
        where: {
            player: {
                guild: {
                    id: guildId
                }
            }
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