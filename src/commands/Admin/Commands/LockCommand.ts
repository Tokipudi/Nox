import { createIfNotExists } from '@lib/database/utils/CommandsUtils';
import { QueryNotFoundError } from '@lib/structures/errors/QueryNotFoundError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    requiredUserPermissions: 'ADMINISTRATOR',
    description: 'Locks a command to a channel.'
})
export class LockCommand extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        const commandName = interaction.options.getString('command', true);
        const command = this.container.stores.get('commands').get(commandName);
        if (command == null) {
            throw new QueryNotFoundError({
                query: commandName
            });
        }

        const channel = interaction.options.getChannel('channel', true);
        const guildCommand = await createIfNotExists(command.name, guildId);

        const authorizedChannelIds = guildCommand.authorizedChannelIds;
        switch (channel.type) {
            case 'GUILD_CATEGORY': {
                const children = channel.children.map(child => child.id);
                let isAllChildrenInParent = true;
                for (let channelId of children) {
                    if (!authorizedChannelIds.includes(channelId)) {
                        authorizedChannelIds.push(channelId);
                        isAllChildrenInParent = false;
                    }
                }
                if (isAllChildrenInParent) {
                    for (let channelId of children) {
                        authorizedChannelIds.splice(authorizedChannelIds.indexOf(channelId), 1);
                    }
                }

                await this.container.prisma.guildsCommands.update({
                    data: {
                        authorizedChannelIds: authorizedChannelIds
                    },
                    where: {
                        guildId_commandName: {
                            commandName: command.name,
                            guildId: guildId
                        }
                    }
                });
                break;
            }
            case 'GUILD_TEXT': {
                if (!authorizedChannelIds.includes(channel.id)) {
                    authorizedChannelIds.push(channel.id);
                } else {
                    authorizedChannelIds.splice(authorizedChannelIds.indexOf(channel.id), 1);
                }

                await this.container.prisma.guildsCommands.update({
                    data: {
                        authorizedChannelIds: authorizedChannelIds
                    },
                    where: {
                        guildId_commandName: {
                            commandName: command.name,
                            guildId: guildId
                        }
                    }
                });
                break;
            }
            default: {
                return await interaction.reply('The channel parameter can either be a `Text Channel`  or a `Category channel`.')
            }
        }

        const channels = [];
        for (let channelId of authorizedChannelIds) {
            channels.push(await this.container.client.channels.fetch(channelId));
        }

        const replyMsg = channels.length > 0
            ? `The command \`${command.name}\` is now locked to the following channels:\n  • ${channels.join('\n  • ')}`
            : `The command \`${command.name}\` is now available in every channels.`
            
        return await interaction.reply(replyMsg);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'command',
                    description: 'The command\'s name',
                    type: 'STRING',
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'channel',
                    description: 'The channel\'s name.',
                    type: 'CHANNEL',
                    channelTypes: [
                        'GUILD_CATEGORY',
                        'GUILD_TEXT'
                    ],
                    required: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}