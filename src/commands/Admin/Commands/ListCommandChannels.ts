import { createIfNotExists, getCommandAuthorizedChannels } from '@lib/database/utils/CommandsUtils';
import { QueryNotFoundError } from '@lib/structures/errors/QueryNotFoundError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    requiredUserPermissions: 'BAN_MEMBERS',
    description: 'Lists a command\s authorized channels.'
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
        await createIfNotExists(command.name, guildId);

        const channels = await getCommandAuthorizedChannels(command.name, guildId);

        const replyMsg = channels.length > 0
            ? `The command \`${command.name}\` can be used in the following channels:\n  • ${channels.join('\n  • ')}`
            : `The command \`${command.name}\` can be used in every channels.`

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
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}