import { container } from '@sapphire/framework';

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

export async function disconnectSkinByName(name: string) {
    return await container.prisma.skins.update({
        data: {
            player: {
                disconnect: true
            }
        },
        where: {
            name: name
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

export async function giveSkinByUserId(recipientId: string, skinName: string) {
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
            name: skinName
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

export async function disconnectWishlistSkinByUserId(userId: string, skinName: string) {
    return await container.prisma.skins.update({
        data: {
            wishedByPlayer: {
                disconnect: {
                    id: userId
                }
            }
        },
        where: {
            name: skinName
        }
    });
}

export async function addSkinToWishlistByUserId(userId: string, skinName: string) {
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
            name: skinName
        }
    });
}

export async function exhaustSkinByName(name: string) {
    return await container.prisma.skins.update({
        data: {
            isExhausted: true
        },
        where: {
            name: name
        }
    });
}