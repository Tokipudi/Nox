import { container } from '@sapphire/framework';
import moment from 'moment';

export async function disconnectSkinById(id: number) {
    return await container.prisma.skins.update({
        data: {
            player: {
                disconnect: true
            }
        },
        where: {
            id: id
        }
    });
}

export async function getSkinsByUserId(id: string) {
    return await container.prisma.skins.findMany({
        where: {
            playerId: id
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
            god: {
                name: 'asc'
            }
        }
    });
}

export async function getSkinByGodName(godName: string, skinName: string) {
    return await container.prisma.skins.findFirst({
        where: {
            god: {
                name: godName
            },
            name: skinName
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
            name: 'asc'
        }
    });
}

export async function getUnclaimedSkins() {
    return await container.prisma.skins.findMany({
        where: {
            playerId: null
        }
    });
}

export async function giveSkinByUserId(recipientId: string, skinId: number) {
    return await container.prisma.skins.update({
        data: {
            player: {
                connectOrCreate: {
                    where: {
                        id: recipientId
                    },
                    create: {
                        id: recipientId
                    }
                }
            }
        },
        where: {
            id: skinId
        }
    });
}

export async function getSkinWishlistByUserId(id: string) {
    return await container.prisma.skins.findMany({
        where: {
            wishedByPlayer: {
                some: {
                    id: id
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
            }
        },
        orderBy: {
            god: {
                name: 'asc'
            }
        }
    });
}

export async function disconnectWishlistSkinByUserId(userId: string, skinId: number) {
    return await container.prisma.skins.update({
        data: {
            wishedByPlayer: {
                disconnect: {
                    id: userId
                }
            }
        },
        where: {
            id: skinId
        }
    });
}

export async function addSkinToWishlistByUserId(userId: string, skinId: number) {
    return await container.prisma.skins.update({
        data: {
            wishedByPlayer: {
                connectOrCreate: {
                    create: {
                        id: userId
                    },
                    where: {
                        id: userId
                    }
                }
            }
        },
        select: {
            id: true,
            name: true
        },
        where: {
            id: skinId
        }
    });
}

export async function exhaustSkinById(id: number) {
    return await container.prisma.skins.update({
        data: {
            isExhausted: true,
            exhaustChangeDate: moment.utc().toDate()
        },
        where: {
            id: id
        }
    });
}

export async function unexhaustSkinById(id: number) {
    return await container.prisma.skins.update({
        data: {
            isExhausted: false,
            exhaustChangeDate: moment.utc().toDate()
        },
        where: {
            id: id
        }
    });
}

export async function resetAllSkins() {
    return await container.prisma.skins.updateMany({
        data: {
            exhaustChangeDate: moment.utc().toDate(),
            isExhausted: false,
            playerId: null
        }
    });
}