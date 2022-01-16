import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand, RegisterBehavior } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    requiredUserPermissions: 'ADMINISTRATOR',
    description: 'Reloads a specific command, or all command if none specified.'
})
export class ReloadCommands extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        await interaction.reply({
            content: `Reloading commands...`,
            ephemeral: true
        });

        const commandName = interaction.options.getString('command');
        if (commandName) {
            const command = this.container.stores.get('commands').get(commandName);
            if (command == null) {
                await interaction.editReply(`Unable to find a command with the name \`${commandName}\``);
            } else {
                await command.reload();
                await interaction.editReply(`The command \`${commandName}\` was succesfully reloaded.`);
            }
        } else {
            const commandNames = [];

            const commands = this.container.stores.get('commands').map(cmd => cmd).sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
            for (let cmd of commands) {
                await cmd.reload();
                this.container.logger.debug(`Reloaded command ${cmd.name}`);
                commandNames.push(`\`${cmd.name}\``);
            }
            await interaction.editReply(`The following commands have been reloaded: \n ${commandNames.join(', ')}`);
        }
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [{
                name: 'command',
                description: 'The command\'s name',
                type: 'STRING',
                autocomplete: true
            }]
        }, {
            guildIds: this.guildIds
        });
    }
}