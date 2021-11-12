import { Achievement } from "@lib/achievements/Achievement";
import { AchievementOptions } from "@lib/achievements/interfaces/AchievementInterface";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Snowflake } from "discord-api-types";

@ApplyOptions<AchievementOptions>({
    description: 'Most standard cards.',
    tokens: 5
})
export class ThePoor extends Achievement {

    async getCurrentUserIds(guildId: Snowflake): Promise<Snowflake[]> {
        const players = await container.prisma.players.findMany({
            include: {
                playersSkins: {
                    where: {
                        skin: {
                            obtainability: {
                                name: 'Standard'
                            }
                        }
                    }
                }
            },
            where: {
                guild: {
                    id: guildId
                }
            }
        });

        let max = 0;
        let userIds = [];
        for (let i in players) {
            const player = players[i];

            if (player.playersSkins.length > max) {
                max = player.playersSkins.length;
            }
        }

        if (max > 0) {
            for (let i in players) {
                const player = players[i];

                if (player.playersSkins.length >= max) {
                    userIds.push(player.userId);
                }
            }
        }

        return userIds;
    }
}