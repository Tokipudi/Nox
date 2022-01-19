import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most fights won.',
    tokens: 5
})
export class TheFighter extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const players = await container.prisma.players.findMany({
            select: {
                id: true,
                win: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                win: 'desc'
            }
        });

        let max = 0;
        const playerIds = [];
        for (let player of players) {
            if (max === 0 && player.win > 0) {
                max = player.win;
            }

            if (max !== 0 && player.win === max) {
                playerIds.push(player.id);
            } else {
                break;
            }
        }

        return playerIds;
    }
}