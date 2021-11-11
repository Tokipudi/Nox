import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class SweetGrindAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'Sweet Grind',
            description: '50 cards rolled.',
            tokens: 2
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {
        const players = await container.prisma.players.findMany({
            select: {
                userId: true
            },
            where: {
                guild: {
                    id: guildId
                },
                rolls: {
                    gte: 50
                }
            }
        });

        const userIds = [];
        for (let i in players) {
            const player = players[i];
            userIds.push(player.userId);
        }

        return userIds;
    }
}