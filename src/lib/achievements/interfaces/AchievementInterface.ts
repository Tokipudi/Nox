import { Snowflake } from "discord-api-types";

export interface AchievementInterface {

    /**
     * Get the user ids that are currently on the run for unlocking this achievement
     * 
     * @param guildId 
     */
    getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]>;

    /**
     * Delivers the achievements to the users of a given guild
     * 
     * @param guildId the guild id the user ids belong to
     */
    deliverAchievement(guildId: Snowflake): Promise<void>;
}

export interface AchievementOptions {
    achievementName?: string,
    description?: string,
    tokens?: number
}