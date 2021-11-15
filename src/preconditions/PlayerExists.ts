import { getPlayer } from '@lib/database/utils/PlayersUtils';
import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class PlayerExists extends Precondition {

    public async run(message: Message): AsyncPreconditionResult {
        const { author, guildId } = message;

        const player = await getPlayer(author.id, guildId);

        if (player == null) {
            try {
                await this.container.prisma.players.create({
                    data: {
                        userId: author.id,
                        guild: {
                            connectOrCreate: {
                                create: {
                                    id: guildId
                                },
                                where: {
                                    id: guildId
                                }
                            }
                        },
                        claimsAvailable: 1,
                        rollsAvailable: 3
                    }
                });
            } catch (e) {
                return this.error({
                    message: `The following error occured when trying to create the player: ${e}`
                });
            }
        }

        return this.ok();
    }
}