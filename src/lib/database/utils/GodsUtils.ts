import { container } from '@sapphire/framework';

export async function getGodByName(name: string) {
    return await container.prisma.gods.findUnique({
        include: {
            pantheon: true,
            skins: {
                where: {
                    name: 'Default'
                }
            }
        },
        where: {
            name: name
        }
    });
}

export async function getGodById(id: number) {
    return await container.prisma.gods.findUnique({
        include: {
            pantheon: true,
            skins: {
                where: {
                    name: 'Default'
                }
            }
        },
        where: {
            id: id
        }
    });
}

export async function getGods() {
    return await container.prisma.gods.findMany();
}