import { container } from "@sapphire/framework";

export async function getSkinIdFromStringParameter(str: string): Promise<number> {
    const matches = str.match(/^"(.+)"\s+(.+)/);
    const skinName = matches[1].trim();
    const godName = matches[2].trim();

    const skin = await container.prisma.skins.findFirst({
        where: {
            name: skinName,
            god: {
                name: godName
            }
        },
        select: {
            id: true
        }
    });

    return skin != null
        ? skin.id
        : 0;
}