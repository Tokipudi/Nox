import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Biggest card collections this season.',
    tokens: 5
})
export class TheCollector extends Achievement {

    async getCurrentPlayerIds(guildId: Snowflake): Promise<number[]> {
        const players = await container.prisma.playersSkins.groupBy({
            by: ['playerId'],
            _count: {
                skinId: true
            },
            orderBy: {
                _count: {
                    skinId: 'desc'
                }
            },
            where: {
                player: {
                    guild: {
                        id: guildId
                    }
                }
            }
        });

        let max = 0;
        const playerIds = [];
        for (let player of players) {
            if (player._count.skinId <= 0) continue;
            
            if (max === 0 && player._count.skinId > 0) {
                max = player._count.skinId;
            }

            if (max !== 0 && player._count.skinId === max) {
                playerIds.push(player.playerId);
            } else {
                break;
            }
        }

        return playerIds;
    }
}