import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class TheLoverAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Lover',
            description: 'Most cards exchanged.',
            tokens: 5
        });
    }

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