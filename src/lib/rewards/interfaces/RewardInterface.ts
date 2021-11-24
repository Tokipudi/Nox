import { PieceOptions } from '@sapphire/pieces';

export interface RewardInterface {

    /**
     * Give the reward to the given player
     * 
     * @param userId
     * @param guildId 
     */
    giveReward(playerId: number, options: GiveRewardOptions): Promise<void>;
}

export interface RewardOptions extends PieceOptions {
    description?: string,
    tokens?: number
}

export interface GiveRewardOptions { }