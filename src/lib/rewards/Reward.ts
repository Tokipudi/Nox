import { getPlayer } from '@lib/database/utils/PlayersUtils';
import { Piece, PieceContext } from '@sapphire/pieces';
import { RewardInterface, RewardOptions } from './interfaces/RewardInterface';

export abstract class Reward extends Piece implements RewardInterface {

    public label: string;
    public description?: string;
    public tokens?: number;

    constructor(context: PieceContext, options?: RewardOptions) {
        super(context, options);
        this.label = options.name.replace(/([A-Z])/g, " $1").trim();
        this.description = options.description;
        this.tokens = options.tokens;
    }

    async giveReward(playerId: number): Promise<void> {
        const player = await getPlayer(playerId);
        if (player.tokens < this.tokens) {
            throw 'You don\'t have enough tokens for this reward.';
        }

        // Give the reward here
    };
}