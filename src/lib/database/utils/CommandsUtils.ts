import { container } from "@sapphire/framework";
import { Snowflake } from "discord.js";

export async function isCommandAuthorizedInChannel(commandName: string, guildId: Snowflake, channelId: Snowflake): Promise<boolean> {
    const guildCommand = await container.prisma.guildsCommands.findUnique({
        where: {
            guildId_commandName: {
                commandName: commandName,
                guildId: guildId
            }
        }
    });
    
    return guildCommand.authorizedChannelIds == null
        || guildCommand.authorizedChannelIds.length <= 0
        || guildCommand.authorizedChannelIds.includes(channelId);
}

export async function getGuildCommand(commandName: string, guildId: Snowflake) {
    return await container.prisma.guildsCommands.findUnique({
        where: {
            guildId_commandName: {
                commandName: commandName,
                guildId: guildId
            }
        }
    });
}

export async function createIfNotExists(commandName: string, guildId: Snowflake) {
    let guildCommand = await container.prisma.guildsCommands.findUnique({
        where: {
            guildId_commandName: {
                commandName: commandName,
                guildId: guildId
            }
        }
    });

    if (guildCommand == null) {
        guildCommand = await container.prisma.guildsCommands.create({
            data: {
                command: {
                    connectOrCreate: {
                        create: {
                            name: commandName
                        },
                        where: {
                            name: commandName
                        }
                    }
                },
                guild: {
                    connectOrCreate: {
                        create: {
                            id: guildId
                        },
                        where: {
                            id: guildId
                        }
                    }
                }
            }
        });
    }

    return guildCommand;
}