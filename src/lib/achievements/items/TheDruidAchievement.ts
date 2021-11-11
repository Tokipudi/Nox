import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class TheDruidAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'The Druid',
            description: 'Most different gods owned.',
            tokens: 5
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {
        const players: any = await container.prisma.$queryRaw`select * from godsamountbyplayers g where "guildId" = ${guildId} order by count desc;`;

        let max = 0;
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.count > 0) {
                max = player.count;
            }

            if (max !== 0 && player.count === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}