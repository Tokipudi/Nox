import { createPlayerIfNotExists } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CacheType, CommandInteraction, CommandInteractionOption, ContextMenuInteraction, Snowflake } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'targetPlayerExists'
})
export class TargetPlayerExists extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { guildId } = interaction;

        const isPlayersCreated = await this.createTargetPlayersIfNotExist(interaction.options.data, guildId);
        if (!isPlayersCreated) {
            return this.error({
                message: 'An error occurred when trying to create a player.'
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        const { guildId } = interaction;

        const isPlayersCreated = await this.createTargetPlayersIfNotExist(interaction.options.data, guildId);
        if (!isPlayersCreated) {
            return this.error({
                message: 'An error occurred when trying to create a player.'
            });
        }

        return this.ok();
    }

    private async createTargetPlayersIfNotExist(options: readonly CommandInteractionOption<CacheType>[], guildId: Snowflake): Promise<boolean> {
        for (let option of options) {
            if (option.type === 'USER' && !option.user.bot) {
                const player = await createPlayerIfNotExists(option.user.id, guildId);
                if (player == null) {
                    return false;
                }
            }
        }
        return true;
    }
}