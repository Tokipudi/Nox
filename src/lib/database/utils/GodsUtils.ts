import { container } from '@sapphire/framework';

export async function getGodByName(name: string) {
    return await container.prisma.gods.findUnique({
        include: {
            pantheon: true,
            skins: {
                where: {
                    name: 'Standard ' + name
                }
            }
        },
        where: {
            name: name
        }
    });
}