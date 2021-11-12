import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most cards stolen.',
    tokens: 5
})
export class TheThief extends Achievement {

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {

        const players = await container.prisma.players.findMany({
            select: {
                userId: true,
                cardsStolen: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                cardsStolen: 'desc'
            }
        });

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.cardsStolen > 0) {
                max = player.cardsStolen;
            }

            if (max !== 0 && player.cardsStolen === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}