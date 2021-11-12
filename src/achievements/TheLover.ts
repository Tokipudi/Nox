import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most cards exchanged.',
    tokens: 5
})
export class TheLover extends Achievement {

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {

        const players = await container.prisma.players.findMany({
            select: {
                userId: true,
                cardsExchanged: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                cardsExchanged: 'desc'
            }
        });

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.cardsExchanged > 0) {
                max = player.cardsExchanged;
            }

            if (max !== 0 && player.cardsExchanged === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}