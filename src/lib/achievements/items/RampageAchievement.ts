import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";
import { Achievement } from "../Achievement";
import { AchievementOptions } from "../interfaces/AchievementInterface";

export class RampageAchievement extends Achievement {

    public constructor(options?: AchievementOptions) {
        super({
            ...options,
            achievementName: 'Rampage',
            description: 'At least 5 different gods in the deck.',
            tokens: 2
        });
    }

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {
        const players: any = await container.prisma.$queryRaw`select * from godsamountbyplayers g where "guildId" = ${guildId} and count >= ${10} order by count desc;`;

        const userIds = [];
        for (let i in players) {
            const player = players[i];
            userIds.push(player.userId);
        }

        return userIds;
    }
}