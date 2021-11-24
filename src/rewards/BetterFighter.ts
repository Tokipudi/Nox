import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<RewardOptions>({
    description: 'Better damage output on your next fight.',
    tokens: 8
})
export class BetterFighter extends Reward {

    async giveReward(playerId: number): Promise<void> {
        await super.giveReward(playerId);

        await this.container.prisma.players.update({
            data: {
                isBoosted: true,
                tokens: {
                    decrement: this.tokens
                }
            },
            where: {
                id: playerId
            }
        });
    }
}