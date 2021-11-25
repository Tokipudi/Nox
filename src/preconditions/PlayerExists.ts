import { createPlayer, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, Command, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'playerExists'
})
export class playerExists extends Precondition {

    public async run(message: Message, command: Command): AsyncPreconditionResult {
        const { author, guildId } = message;

        const player = await getPlayerByUserId(author.id, guildId);

        if (player == null) {
            try {
                await createPlayer(author.id, guildId);
            } catch (e) {
                return this.error({
                    message: `The following error occured when trying to create the player: ${e}`
                });
            }
        }

        return this.ok();
    }
}