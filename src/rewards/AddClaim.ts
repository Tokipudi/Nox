import { RewardOptions } from '@lib/rewards/interfaces/RewardInterface';
import { Reward } from '@lib/rewards/Reward';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<RewardOptions>({
    description: 'Get an additional claim (can go over the limit).',
    tokens: 8
})
export class AddClaim extends Reward {

    async giveReward(playerId: number): Promise<void> {
        await super.giveReward(playerId);

        await this.container.prisma.players.update({
            data: {
                claimsAvailable: {
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