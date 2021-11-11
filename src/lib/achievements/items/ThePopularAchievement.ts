import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class ThePopularAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Popular',
            description: 'Most cards received.',
            tokens: 5
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {

        const players = await container.prisma.players.findMany({
            select: {
                userId: true,
                cardsReceived: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                cardsReceived: 'desc'
            }
        });

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.cardsReceived > 0) {
                max = player.cardsReceived;
            }

            if (max !== 0 && player.cardsReceived === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}