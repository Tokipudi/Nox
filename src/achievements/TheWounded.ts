import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most cards lost by fighting.',
    tokens: 5
})
export class TheWounded extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const players = await container.prisma.players.findMany({
            select: {
                id: true,
                allInLoss: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                allInLoss: 'desc'
            }
        });

        let max = 0;
        const playerIds = [];
        for (let player of players) {
            if (max === 0 && player.allInLoss > 0) {
                max = player.allInLoss;
            }

            if (max !== 0 && player.allInLoss === max) {
                playerIds.push(player.id);
            } else {
                break;
            }
        }

        return playerIds;
    }
}