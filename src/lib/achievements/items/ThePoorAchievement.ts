import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class ThePoorAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Poor',
            description: 'Most standard cards.',
            tokens: 5
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {
        const players = await container.prisma.players.findMany({
            include: {
                playersSkins: {
                    where: {
                        skin: {
                            obtainability: {
                                name: 'Standard'
                            }
                        }
                    }
                }
            },
            where: {
                guild: {
                    id: guildId
                }
            }
        });

        let max = 0;
        let userIds = [];
        for (let i in players) {
            const player = players[i];

            if (player.playersSkins.length > max) {
                max = player.playersSkins.length;
            }
        }

        if (max > 0) {
            for (let i in players) {
                const player = players[i];

                if (player.playersSkins.length >= max) {
                    userIds.push(player.userId);
                }
            }
        }

        return userIds;
    }
}