import { container, SapphireClient } from '@sapphire/framework';
import { ClientOptions } from "discord.js";
import { PrismaClient } from '@prisma/client';
import '@sapphire/plugin-logger/register';

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