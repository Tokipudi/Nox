import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CacheType, CommandInteraction, CommandInteractionOption, ContextMenuInteraction, Snowflake } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'targetIsNotBanned'
})
export class TargetIsNotBanned extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { guildId } = interaction;

        const containsBannedPlayers = await this.optionsContainBannedPlayer(interaction.options.data, guildId);
        if (containsBannedPlayers) {
            return this.error({
                message: `You cannot target banned players with this command.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        const { guildId } = interaction;

        const containsBannedPlayers = await this.optionsContainBannedPlayer(interaction.options.data, guildId);
        if (containsBannedPlayers) {
            return this.error({
                message: `You cannot target banned players with this command.`
            });
        }

        return this.ok();
    }

    private async optionsContainBannedPlayer(options: readonly CommandInteractionOption<CacheType>[], guildId: Snowflake): Promise<boolean> {
        for (let option of options) {
            if (option.type === 'USER' && !option.user.bot) {
                const player = await getPlayerByUserId(option.user.id, guildId);
                if (player.isBanned) {
                    return true;
                }
            }
        }
        return false;
    }
}