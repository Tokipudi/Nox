import { getMaxSkinsPerTeam, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CacheType, CommandInteraction, CommandInteractionOption, ContextMenuInteraction, Snowflake } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'targetPlayerTeamAmountNotMax'
})
export class TargetPlayerTeamAmountNotMax extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { guildId } = interaction;

        const isTargetPlayerTeamMax = await this.isTargetPlayerTeamMax(interaction.options.data, guildId);
        if (isTargetPlayerTeamMax) {
            return this.error({
                message: `Target player's team has reached the limit of \`${getMaxSkinsPerTeam()}\` skins per team.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        const { guildId } = interaction;

        const isTargetPlayerTeamMax = await this.isTargetPlayerTeamMax(interaction.options.data, guildId);
        if (isTargetPlayerTeamMax) {
            return this.error({
                message: `Target player's team has reached the limit of \`${getMaxSkinsPerTeam()}\` skins per team.`
            });
        }

        return this.ok();
    }

    private async isTargetPlayerTeamMax(options: readonly CommandInteractionOption<CacheType>[], guildId: Snowflake): Promise<boolean> {
        for (let option of options) {
            if (option.type === 'USER' && !option.user.bot) {
                const player = await getPlayerByUserId(option.user.id, guildId);
                const skins = await getSkinsByPlayer(player.id);
                if (skins && skins.length >= getMaxSkinsPerTeam()) {
                    return true;
                }
            }
        }
        return false;
    }
}