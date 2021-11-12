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

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {

        const players = await container.prisma.players.findMany({
            select: {
                userId: true,
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
        const userIds = [];
        for (let i in players) {
            const player = players[i];

            if (max === 0 && player.loss > 0) {
                max = player.loss;
            }

            if (max !== 0 && player.loss === max) {
                userIds.push(player.userId);
            } else {
                break;
            }
        }

        return userIds;
    }
}