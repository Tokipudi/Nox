import { container } from '@sapphire/framework';
import { Snowflake } from 'discord-api-types';
import { AchievementInterface, AchievementOptions } from './interfaces/AchievementInterface';

export abstract class Achievement implements AchievementInterface {

    public achievementName: string;
    public description: string;
    public tokens: number;

    constructor(options?: AchievementOptions) {
        this.achievementName = options.achievementName;
        this.description = options.description;
        this.tokens = options.tokens;
    }

    abstract getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]>;

    async deliverAchievement(guildId: Snowflake): Promise<void> {
        const userIds = await this.getCurrentUserIds(guildId);
        await this.addAchievementRoleByUserIds(userIds, guildId);
    };

    /**
     * Adds a the achievement role to the users
     * 
     * @param userIds the users to give the achievement to
     * @param guildId the guild the users belong to
     */
    async addAchievementRoleByUserIds(userIds: Snowflake[], guildId: Snowflake): Promise<void> {
        try {
            const guild = await container.client.guilds.fetch(guildId);
            let role = (await guild.roles.fetch()).find(role => role.name === this.achievementName);

            if (role == null) {
                role = await guild.roles.create({ name: this.achievementName, color: 'DARK_PURPLE', reason: 'Role created automatically as a reward for Smite\s CCG.' });
                container.logger.info(`Role ${this.achievementName} created.`);
            }

            for (let i in userIds) {
                const userId = userIds[i];

                const user = await guild.members.fetch(userId);
                await user.roles.add(role);

                container.logger.info(`User <${userId}> was added the role ${this.achievementName}.`);
            }
        } catch (e) {
            container.logger.error(e);
        }
    }
}