import { Guilds, PlayersSeasonsArchive } from '.prisma/client';
import { fetchAchievements } from '@lib/achievements/AchievementUtils';
import { resetAllSkinsByGuildId } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Resets the game and start a new season.',
    detailedDescription: 'Resets every skins and every player in the current guild before starting a new season.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Ragnarock extends NoxCommand {

    public async messageRun(message: Message) {
        const { author, guildId } = message;
        const prefix = this.container.client.options.defaultPrefix;

        await message.reply(`Are you sure you wish to start a new season on this server? This will remove all players acquired skins, wished skins and restart the game.\nType \`${prefix}yes\` to agree, or \`${prefix}no\` otherwise.`)

        const filter = (m: Message) => {
            return m.author.id === author.id && (m.content === `${prefix}yes` || m.content === `${prefix}no`);
        };
        const collector = message.channel.createMessageCollector({ filter, time: 120000 /* 2min */ });

        collector.on('collect', async (m: Message) => {
            if (m.content === `${prefix}no`) {
                await message.reply('NoxCommand aborted.');
                collector.stop();
            } else if (m.content === `${prefix}yes`) {
                collector.stop();

                const reply = await m.reply('`Starting the new season...`');

                let guild: Guilds = await this.container.prisma.guilds.findUnique({
                    where: {
                        id: guildId
                    }
                });

                const { season } = await this.startNewSeason(guild);

                await reply.edit(`Game has been reset.\nThe current season is now **${season}**.`);
            }
        });
    }

    private async startNewSeason(guild: Guilds): Promise<Guilds> {
        await this.archiveOldSeason(guild);
        return await this.container.prisma.guilds.update({
            data: {
                season: {
                    increment: 1
                }
            },
            where: {
                id: guild.id
            }
        });
    }

    private async archiveOldSeason(guild: Guilds): Promise<void> {
        const players = await this.container.prisma.players.findMany({
            distinct: ['id'],
            include: {
                guild: true,
                playersSkins: true
            },
            where: {
                guild: {
                    id: guild.id
                }
            }
        });

        if (players !== null && players.length >= 0) {
            const data: PlayersSeasonsArchive[] = [];
            const playerIds = [];

            for (let player of players) {
                playerIds.push(player.id);

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
                    playerId: player.id,
                    season: guild.season,
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

            await this.container.prisma.playersSeasonsArchive.createMany({ data: data });

            const achievements = fetchAchievements();
            for (const achievement of achievements) {
                await achievement.deliverAchievement(guild.id);
            }

            await resetAllSkinsByGuildId(guild.id);

            await this.container.prisma.players.updateMany({
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
                    id: {
                        in: playerIds
                    }
                }
            });
        }
    }
}