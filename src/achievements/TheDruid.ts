import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { GodsAmountByPlayers } from "@lib/database/interfaces/ViewsInterfaces";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most different gods owned.',
    tokens: 5
})
export class TheDruid extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const rows: GodsAmountByPlayers = await container.prisma.$queryRaw`select * from godsamountbyplayers g where "guildId" = ${guildId} order by count desc;`;

        let max = 0;
        const playerIds = [];
        for (let row of rows) {
            if (max === 0 && row.count > 0) {
                max = row.count;
            }

            if (max !== 0 && row.count === max) {
                playerIds.push(row.playerId);
            } else {
                break;
            }
        }

        return playerIds;
    }
}