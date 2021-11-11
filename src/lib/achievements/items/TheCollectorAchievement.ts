import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class TheCollectorAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Collector',
            description: 'Biggest card collections this season.',
            tokens: 5
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {
        const players = await container.prisma.playersSkins.groupBy({
            by: ['userId'],
            _count: {
                skinId: true
            },
            orderBy: {
                _count: {
                    skinId: 'desc'
                }
            },
            where: {
                guildId: guildId
            }
        });

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player._count.skinId > 0) {
                max = player._count.skinId;
            }

            if (max !== 0 && player._count.skinId === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}