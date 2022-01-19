import { isGuildActive } from '@lib/database/utils/GuildsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'guildIsActive'
})
export class GuildIsActive extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { guildId } = interaction;

        const isActive = await isGuildActive(guildId);
        if (!isActive) {
            return this.error({
                message: `You cannot run this command because this guild is disabled.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        const { guildId } = interaction;

        const isActive = await isGuildActive(guildId);
        if (!isActive) {
            return this.error({
                message: `You cannot run this command because this guild is disabled.`
            });
        }

        return this.ok();
    }
}