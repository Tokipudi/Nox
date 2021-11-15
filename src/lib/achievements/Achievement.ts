import { container } from '@sapphire/framework';
import { Piece, PieceContext } from '@sapphire/pieces';
import { Snowflake } from 'discord-api-types';
import { AchievementInterface, AchievementOptions } from './interfaces/AchievementInterface';

export abstract class Achievement extends Piece implements AchievementInterface {

    public label: string;
    public description?: string;
    public tokens?: number;

    constructor(context: PieceContext, options?: AchievementOptions) {
        super(context, options);
        this.label = options.name.replace(/([A-Z])/g, " $1").trim();
        this.description = options.description;
        this.tokens = options.tokens;
    }

    abstract getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]>;

    async deliverAchievement(guildId: Snowflake): Promise<void> {
        const userIds = await this.getCurrentUserIds(guildId);
        await this.addAchievementRoleByUserIds(userIds, guildId);

        if (this.tokens != null && this.tokens > 0) {
            await this.container.prisma.players.updateMany({
                data: {
                    tokens: {
                        increment: this.tokens
                    }
                },
                where: {
                    userId: {
                        in: userIds
                    },
                    guild: {
                        id: guildId
                    }
                }
            });
        }
    };

    /**
     * Adds the achievement role to the users
     * 
     * @param userIds the users to give the achievement to
     * @param guildId the guild the users belong to
     */
    async addAchievementRoleByUserIds(userIds: Snowflake[], guildId: Snowflake): Promise<void> {
        try {
            const guild = await container.client.guilds.fetch(guildId);
            let role = (await guild.roles.fetch()).find(role => role.name === this.label);

            if (role == null) {
                role = await guild.roles.create({ name: this.label, color: 'DARK_PURPLE', reason: 'Role created automatically as a reward for Smite\s CCG.' });
                container.logger.info(`Role ${this.label} created.`);
            }

            for (let i in userIds) {
                const userId = userIds[i];

                const user = await guild.members.fetch(userId);
                await user.roles.add(role);

                container.logger.info(`User <${userId}> was added the role ${this.label}.`);
            }
        } catch (e) {
            container.logger.error(e);
        }
    }
}