import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';
import { Snowflake } from 'discord-api-types';

@ApplyOptions<RewardOptions>({
    description: 'Get an additional claim (can go over the limit).',
    tokens: 8
})
export class AddClaim extends Reward {

    async giveReward(userId: Snowflake, guildId: Snowflake): Promise<void> {
        await this.container.prisma.players.update({
            data: {
                claimsAvailable: {
                    increment: 1
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