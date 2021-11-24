import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<RewardOptions>({
    description: 'Get an additional roll (can go over the limit).',
    tokens: 5
})
export class AddRoll extends Reward {

    async giveReward(playerId: number): Promise<void> {
        await super.giveReward(playerId);

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
                id: playerId
            }
        });
    }
}