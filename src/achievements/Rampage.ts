import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'At least 5 different gods in the deck.',
    tokens: 2
})
export class Rampage extends Achievement {

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