import { PrismaClient } from '@prisma/client';
import { container, SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import { ClientOptions } from "discord.js";

export class NoxClient extends SapphireClient {

    public constructor(options: ClientOptions) {
        super(options);
        container.prisma = new PrismaClient();
    }
}

declare module '@sapphire/pieces' {
    interface Container {
        prisma: PrismaClient
    }
}