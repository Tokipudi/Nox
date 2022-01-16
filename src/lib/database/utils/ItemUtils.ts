import { container } from "@sapphire/framework";

export async function getItemByName(name: string, activeFlag: boolean = true) {
    return await container.prisma.items.findFirst({
        where: {
            name: {
                equals: name,
                mode: 'insensitive'
            },
            activeFlag: activeFlag
        }
    });
}