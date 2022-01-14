import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'canPlayerRoll'
})
export class CanPlayerRoll extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const player = await getPlayerByUserId(user.id, guildId);
        if (player == null) {
            return this.error({
                message: `An error occured when trying to load the player for ${user}.`
            });
        }

        if (player.isBanned) {
            return this.error({
                message: `${user} Is banned and cannot roll.`
            });
        }

        if (player.rollsAvailable <= 0) {
            return this.error({
                message: `${user} Does not have any rolls available right now.`
            });
        }

        return this.ok();
    }
}