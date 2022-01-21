import { isCommandAuthorizedInChannel } from '@lib/database/utils/CommandsUtils';
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
            return this.error({
                message: await this.getChannelsAvailableMessage(interaction)
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        if (!(await this.commandIsAuthorized(interaction))) {
            return this.error({
                message: await this.getChannelsAvailableMessage(interaction)
            });
        }

        return this.ok();
    }

    private async getChannelsAvailableMessage(interaction: CommandInteraction | ContextMenuInteraction) {
        const guildCommand = await this.container.prisma.guildsCommands.findUnique({
            where: {
                guildId_commandName: {
                    commandName: interaction.commandName,
                    guildId: interaction.guildId
                }
            }
        });

        const channels = [];
        for (let channelId of guildCommand.authorizedChannelIds) {
            channels.push(await this.container.client.channels.fetch(channelId));
        }

        return `This command can only be used in the following channels:\n  • ${channels.join('\n  • ')}`
    }

    private async commandIsAuthorized(interaction: CommandInteraction | ContextMenuInteraction): Promise<boolean> {
        return await isCommandAuthorizedInChannel(interaction.command.name, interaction.guildId, interaction.channelId);
    }
}