import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class TheFighterAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Fighter',
            description: 'Most fights won.',
            tokens: 5
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {

        const players = await container.prisma.players.findMany({
            select: {
                userId: true,
                win: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                win: 'desc'
            }
        });

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.win > 0) {
                max = player.win;
            }

            if (max !== 0 && player.win === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}