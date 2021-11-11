import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class TheGiverAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Giver',
            description: 'Most cards given.',
            tokens: 5
        });
    }

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