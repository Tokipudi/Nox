import { isGuildActive, setGuildActive, setGuildInactive } from '@lib/database/utils/GuildsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Toggles the current\'s guild "Active" status for the Smite CCG.',
    requiredUserPermissions: 'BAN_MEMBERS'
})
export class ToggleCCG extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        const isActive = await isGuildActive(guildId);
        if (isActive) {
            await setGuildInactive(guildId);
            return interaction.reply('The Smite CCG has been disabled for this guild.');
        } else {
            await setGuildActive(guildId);
            return interaction.reply('The Smite CCG has been activated for this guild.');
        }
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: this.guildIds
        });
    }
}