import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most fights lost.',
    tokens: 5
})
export class TheStubborn extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const players = await container.prisma.players.findMany({
            select: {
                id: true,
                loss: true
            },
            where: {
                guild: {
                    id: guildId
                }
            },
            orderBy: {
                loss: 'desc'
            }
        });

        let max = 0;
        const playerIds = [];
        for (let player of players) {
            if (max === 0 && player.loss > 0) {
                max = player.loss;
            }

            if (max !== 0 && player.loss === max) {
                playerIds.push(player.id);
            } else {
                break;
            }
        }

        return playerIds;
    }
}