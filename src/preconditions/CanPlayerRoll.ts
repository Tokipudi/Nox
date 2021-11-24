import { getPlayerByUserId, getTimeLeftBeforeRoll } from '@lib/database/utils/PlayersUtils';
import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class CanPlayerRoll extends Precondition {

    public async run(message: Message): AsyncPreconditionResult {
        const { author, guildId } = message;

        const player = await getPlayerByUserId(author.id, guildId);

        if (player != null && player.isBanned) {
            return this.error({
                message: `You are banned from the game.`
            });
        }

        if (player != null && player.rollsAvailable <= 0) {
            const duration = await getTimeLeftBeforeRoll(player.id);

            return this.error({
                message: `You have to wait \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\` before rolling a new card again.`
            });
        }

        return this.ok();
    }
}