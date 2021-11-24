import { Players } from '.prisma/client';
import { createPlayer } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Argument, ArgumentContext, ArgumentOptions, Resolvers } from '@sapphire/framework';

@ApplyOptions<ArgumentOptions>({
    name: 'player'
})
export class PlayerArgument extends Argument<Players> {

    public async run(parameter: string, context: ArgumentContext) {
        const resolvedUser = await Resolvers.resolveUser(parameter);
        if (resolvedUser.success) {
            try {
                let player = await this.container.prisma.players.findFirst({
                    where: {
                        user: {
                            id: resolvedUser.value.id
                        },
                        guild: {
                            id: context.message.guildId
                        }
                    }
                });
                if (player == null) {
                    player = await createPlayer(resolvedUser.value.id, context.message.guildId);
                }
                return this.ok(player);
            } catch (e) {
                // Do Nothing
            }
        }

        return this.error({
            parameter,
            identifier: resolvedUser.error,
            message: 'The given argument did not resolve to a Discord user.',
            context
        });
    }
}
