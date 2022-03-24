import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<RewardOptions>({
    description: 'Resets the available rolls to 3.',
    tokens: 5
})
export class ResetRolls extends Reward {

    async giveReward(playerId: number): Promise<void> {
        await super.giveReward(playerId);

        await this.container.prisma.players.update({
            data: {
                rollsAvailable: 3,
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