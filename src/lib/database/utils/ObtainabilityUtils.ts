import { container } from "@sapphire/pieces";

export async function getObtainabilities() {
    return await container.prisma.skinsObtainability.findMany();
}