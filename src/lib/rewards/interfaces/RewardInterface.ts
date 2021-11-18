import { PieceOptions } from '@sapphire/pieces';
import { Snowflake } from "discord-api-types";

export interface RewardInterface {

    /**
     * Give the reward to the given player
     * 
     * @param userId
     * @param guildId 
     */
    giveReward(userId: Snowflake, guildId: Snowflake, options: GiveRewardOptions): Promise<void>;
}

export interface RewardOptions extends PieceOptions {
    description?: string,
    tokens?: number
}

export interface GiveRewardOptions { }