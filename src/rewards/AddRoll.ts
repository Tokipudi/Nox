import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';
import { Snowflake } from 'discord-api-types';

@ApplyOptions<RewardOptions>({
    description: 'Get an additional roll (can go over the limit).',
    tokens: 5
})
export class AddRoll extends Reward {

    async giveReward(userId: Snowflake, guildId: Snowflake): Promise<void> {
        await super.giveReward(userId, guildId);

        await this.container.prisma.players.update({
            data: {
                rollsAvailable: {
                    increment: 1
                },
                tokens: {
                    decrement: this.tokens
                }
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });
    }
}