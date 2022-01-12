import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message, Snowflake } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'canPlayerRoll'
})
export class CanPlayerRoll extends Precondition {

    public async messageRun(message: Message): AsyncPreconditionResult {
        const { author, guildId } = message;

        const canPlayerRoll = await this.canPlayerRoll(author.id, guildId);

        return canPlayerRoll
            ? this.ok()
            : this.error({
                message: `You are unable to roll right now.`
            });
    }

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const canPlayerRoll = await this.canPlayerRoll(user.id, guildId);

        return canPlayerRoll
            ? this.ok()
            : this.error({
                message: `You are unable to roll right now.`
            });
    }

    private async canPlayerRoll(userId: Snowflake, guildId: Snowflake) {
        const player = await getPlayerByUserId(userId, guildId);

        return player != null && !player.isBanned && player.rollsAvailable > 0;
    }
}