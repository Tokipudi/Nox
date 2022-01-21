import { getCommandAuthorizedChannels, isCommandAuthorizedInChannel } from '@lib/database/utils/CommandsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'commandIsAuthorizedInChannel',
    position: 20
})
export class CommandIsAuthorizedInChannel extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        if (!(await this.commandIsAuthorized(interaction))) {
            const channels = await getCommandAuthorizedChannels(command.name, interaction.guildId);
            return this.error({
                message: `This command can only be used in the following channels:\n  • ${channels.join('\n  • ')}`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        if (!(await this.commandIsAuthorized(interaction))) {
            const channels = await getCommandAuthorizedChannels(command.name, interaction.guildId);
            return this.error({
                message: `This command can only be used in the following channels:\n  • ${channels.join('\n  • ')}`
            });
        }

        return this.ok();
    }

    private async commandIsAuthorized(interaction: CommandInteraction | ContextMenuInteraction): Promise<boolean> {
        return await isCommandAuthorizedInChannel(interaction.command.name, interaction.guildId, interaction.channelId);
    }
}