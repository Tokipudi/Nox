import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most cards given.',
    tokens: 5
})
export class TheGiver extends Achievement {

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {

        const players = await container.prisma.players.findMany({
            select: {
                userId: true,
                cardsGiven: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                cardsGiven: 'desc'
            }
        });

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.cardsGiven > 0) {
                max = player.cardsGiven;
            }

            if (max !== 0 && player.cardsGiven === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}