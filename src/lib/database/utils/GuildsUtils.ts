import { PlayersSeasonsArchive } from ".prisma/client";
import { Achievement } from "@lib/achievements/Achievement";
import { container } from "@sapphire/pieces";
import { Snowflake } from "discord-api-types";
import { getPlayers } from "./PlayersUtils";
import { resetAllSkinsByGuildId } from "./SkinsUtils";

export async function getGuilds() {
    return await container.prisma.guilds.findMany();
}

export async function startNewSeason(guildId: Snowflake) {
    const players = await getPlayers(guildId);
    if (players !== null && players.length >= 0) {
        const data: PlayersSeasonsArchive[] = [];
        const playerIds = [];

        container.stores.get('achievements').forEach((achievement: Achievement) => {
            achievement.deliverAchievement(guildId);
        });

        for (let i in players) {
            const player = players[i];

            playerIds.push(player.userId);

            let wins = 0;
            let losses = 0;
            let favoriteSkinId = null;
            for (let j in player.playersSkins) {
                const playerSkin = player.playersSkins[j];
                wins += playerSkin.win;
                losses += playerSkin.loss;
                if (playerSkin.isFavorite) {
                    favoriteSkinId = playerSkin.skinId;
                }
            }

            data.push({
                userId: player.userId,
                guildId: player.guild.id,
                season: player.guild.season,
                claimedCards: player.claimedCards,
                highestLosingStreak: player.highestLosingStreak,
                highestWinningStreak: player.highestWinningStreak,
                rolls: player.rolls,
                loss: losses,
                win: wins,
                cardsGiven: player.cardsGiven,
                cardsExchanged: player.cardsExchanged,
                cardsStolen: player.cardsStolen,
                cardsReceived: player.cardsReceived,
                favoriteSkinId: favoriteSkinId,
                allInLoss: player.allInLoss,
                allInWins: player.allInWins
            });
        }

        await container.prisma.playersSeasonsArchive.createMany({ data: data });

        await resetAllSkinsByGuildId(guildId);

        await container.prisma.players.updateMany({
            data: {
                highestLosingStreak: 0,
                highestWinningStreak: 0,
                losingStreak: 0,
                winningStreak: 0,
                rolls: 0,
                cardsExchanged: 0,
                cardsGiven: 0,
                cardsReceived: 0,
                cardsStolen: 0,
                claimedCards: 0,
                lastClaimChangeDate: null,
                rollsAvailable: 3,
                claimsAvailable: 1,
                loss: 0,
                win: 0
            },
            where: {
                userId: {
                    in: playerIds
                },
                guild: {
                    id: guildId
                }
            }
        });
    }

    return await container.prisma.guilds.update({
        data: {
            season: {
                increment: 1
            }
        },
        where: {
            id: guildId
        }
    });
}