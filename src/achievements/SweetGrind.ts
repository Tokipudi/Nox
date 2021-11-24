import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: '50 cards rolled.',
    tokens: 2
})
export class SweetGrind extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const players = await container.prisma.players.findMany({
            select: {
                id: true
            },
            where: {
                guild: {
                    id: guildId
                },
                rolls: {
                    gte: 50
                }
            }
        });

        const playerIds = [];
        for (let player of players) {
            playerIds.push(player.id);
        }

        return playerIds;
    }
}