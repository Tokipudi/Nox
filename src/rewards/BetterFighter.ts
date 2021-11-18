import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';
import { Snowflake } from 'discord-api-types';

@ApplyOptions<RewardOptions>({
    description: 'Better damage output on your next fight.',
    tokens: 8
})
export class BetterFighter extends Reward {

    async giveReward(userId: Snowflake, guildId: Snowflake): Promise<void> {
        await super.giveReward(userId, guildId);
        
        await this.container.prisma.players.update({
            data: {
                isBoosted: true,
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