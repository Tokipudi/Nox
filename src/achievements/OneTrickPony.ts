import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { GodsAmountByPlayers, PlayerSkinsAmountByGod } from "@lib/database/interfaces/ViewsInterfaces";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Have at least 15 skins of a single god.',
    tokens: 8
})
export class OneTrickPony extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const rows: PlayerSkinsAmountByGod = await container.prisma.$queryRaw`select * from playerskinsamountbygod g where "guildId" = ${guildId} and "skinsAmount" >= ${15} order by "skinsAmount" desc;`;

        const playerIds = [];
        for (let row of rows) {
            playerIds.push(row.playerId);
        }

        return playerIds;
    }
}