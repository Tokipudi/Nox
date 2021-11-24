import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { GodsAmountByPlayers } from "@lib/database/interfaces/ViewsInterfaces";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'At least 5 different gods in the deck.',
    tokens: 2
})
export class Rampage extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const rows: GodsAmountByPlayers = await container.prisma.$queryRaw`select * from godsamountbyplayers g where "guildId" = ${guildId} and count >= ${10} order by count desc;`;

        const playerIds = [];
        for (let row of rows) {
            playerIds.push(row.playerId);
        }

        return playerIds;
    }
}