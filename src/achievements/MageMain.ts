import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { GodsRoleByPlayers } from "@lib/database/interfaces/ViewsInterfaces";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Have at least 15 different mage gods in your team.',
    tokens: 8
})
export class MageMain extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const rows: GodsRoleByPlayers = await container.prisma.$queryRaw`select * from magegodsbyplayers g where "guildId" = ${guildId} and "godsAmount" >= ${15} order by "godsAmount" desc;`;

        const playerIds = [];
        for (let row of rows) {
            playerIds.push(row.playerId);
        }

        return playerIds;
    }
}