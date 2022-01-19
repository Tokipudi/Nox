import { getGuildById } from '@lib/database/utils/GuildsUtils';
import { delay } from '@lib/utils/Utils';
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

    abstract getCurrentPlayerIds(guildId: Snowflake): Promise<number[]>;

    async deliverAchievement(guildId: Snowflake): Promise<void> {
        const playerIds = await this.getCurrentPlayerIds(guildId);

        await this.removeAchievementRole(guildId);
        if (playerIds.length > 0) {
            await this.addAchievementRoleByPlayerIds(playerIds, guildId);

            if (this.tokens != null && this.tokens > 0) {
                const achievement = await this.container.prisma.achievements.findUnique({
                    where: {
                        name: this.label
                    }
                });
                const guild = await getGuildById(guildId)

                // Update tokens
                for (let playerId of playerIds) {
                    await this.container.prisma.players.update({
                        data: {
                            tokens: {
                                increment: this.tokens
                            }
                        },
                        where: {
                            id: playerId
                        }
                    });

                    // Update achievements archive
                    await this.container.prisma.playersSeasonsAchievements.create({
                        data: {
                            achievementId: achievement.id,
                            playerId: playerId,
                            season: guild.season
                        }
                    });
                }
            }
        }
    };

    /**
     * Adds the achievement role to the users
     * 
     * @param playerIds the users to give the achievement to
     * @param guildId the guild the users belong to
     */
    async addAchievementRoleByPlayerIds(playerIds: number[], guildId: Snowflake): Promise<void> {
        try {
            const players = await this.container.prisma.players.findMany({
                where: {
                    id: {
                        in: playerIds
                    },
                    guild: {
                        id: guildId
                    }
                },
                include: {
                    user: true,
                    guild: true
                }
            });

            for (let player of players) {
                const guild = await container.client.guilds.fetch(player.guild.id);
                let role = (await guild.roles.fetch()).find(role => role.name === this.label);
                if (role == null) {
                    role = await guild.roles.create({ name: this.label, color: 'DARK_PURPLE', reason: 'Role created automatically as a reward for Smite\s CCG.' });
                    container.logger.info(`Role ${this.label} created.`);
                }

                const user = await guild.members.fetch(player.user.id);
                await user.roles.add(role);

                container.logger.info(`Player ${player.id} was added the role ${this.label}.`);
            }


        } catch (e) {
            container.logger.error(e);
        }
    }

    /**
     * Remove the achievement for all users in the guild
     * 
     * @param guildId the guild the users belong to
     */
    async removeAchievementRole(guildId: Snowflake): Promise<void> {
        try {
            const players = await this.container.prisma.players.findMany({
                where: {
                    guild: {
                        id: guildId
                    }
                },
                include: {
                    user: true,
                    guild: true
                }
            });

            for (let player of players) {
                const guild = await container.client.guilds.fetch(player.guild.id);
                let role = (await guild.roles.fetch()).find(role => role.name === this.label);
                if (role != null) {
                    const user = await guild.members.fetch(player.user.id);
                    if (user.roles.cache.some(r => r.id === role.id)) {
                        await user.roles.remove(role);
                        await delay(500);
                        container.logger.info(`Player ${player.id} was removed the role ${this.label}.`);
                    }
                }
            }
        } catch (e) {
            container.logger.error(e);
        }
    }
}