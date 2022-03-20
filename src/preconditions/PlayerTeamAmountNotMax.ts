import { getMaxSkinsPerTeam, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'playerTeamAmountNotMax'
})
export class PlayerTeamAmountNotMax extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const authorPlayer = await getPlayerByUserId(user.id, guildId);
        const skins = await getSkinsByPlayer(authorPlayer.id);

        const maxSkinsPerTeam = getMaxSkinsPerTeam();
        if (skins && skins.length >= maxSkinsPerTeam) {
            return this.error({
                message: `Player ${authorPlayer} has ${skins.length} and the limit is ${maxSkinsPerTeam}.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        const { member, guildId } = interaction;
        const { user } = member;

        const authorPlayer = await getPlayerByUserId(user.id, guildId);
        const skins = await getSkinsByPlayer(authorPlayer.id);

        const maxSkinsPerTeam = getMaxSkinsPerTeam();
        if (skins && skins.length >= maxSkinsPerTeam) {
            return this.error({
                message: `Player ${authorPlayer} has ${skins.length} and the limit is ${maxSkinsPerTeam}.`
            });
        }

        return this.ok();
    }
}