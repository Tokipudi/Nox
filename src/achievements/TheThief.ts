import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most cards stolen.',
    tokens: 5
})
export class TheThief extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const players = await container.prisma.players.findMany({
            select: {
                id: true,
                cardsStolen: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                cardsStolen: 'desc'
            }
        });

        let max = 0;
        const playerIds = [];
        for (let player of players) {
            if (max === 0 && player.cardsStolen > 0) {
                max = player.cardsStolen;
            }

            if (max !== 0 && player.cardsStolen === max) {
                playerIds.push(player.id);
            } else {
                break;
            }
        }

        return playerIds;
    }
}