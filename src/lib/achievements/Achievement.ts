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

        if (playerIds.length > 0) {
            await this.addAchievementRoleByPlayerIds(playerIds);

            if (this.tokens != null && this.tokens > 0) {
                // Update tokens
                await this.container.prisma.players.updateMany({
                    data: {
                        tokens: {
                            increment: this.tokens
                        }
                    },
                    where: {
                        id: {
                            in: playerIds
                        }
                    }
                });

                // Update achievements archive
                const achievement = await this.container.prisma.achievements.findUnique({
                    where: {
                        name: this.label
                    }
                });
                const guild = await this.container.prisma.guilds.findUnique({
                    where: {
                        id: guildId
                    }
                });

                for (let playerId of playerIds) {
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
     * @param userIds the users to give the achievement to
     * @param guildId the guild the users belong to
     */
    async addAchievementRoleByPlayerIds(playerIds: number[]): Promise<void> {
        try {
            const players = await this.container.prisma.players.findMany({
                where: {
                    id: {
                        in: playerIds
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
}