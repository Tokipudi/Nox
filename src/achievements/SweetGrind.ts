import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: '50 cards rolled.',
    tokens: 2
})
export class SweetGrind extends Achievement {

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