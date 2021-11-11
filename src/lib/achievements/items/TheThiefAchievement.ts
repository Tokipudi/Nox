import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class TheThiefAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Thief',
            description: 'Most cards stolen.',
            tokens: 5
        });
    }

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