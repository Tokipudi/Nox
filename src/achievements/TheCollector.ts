import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Biggest card collections this season.',
    tokens: 5
})
export class TheCollector extends Achievement {

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