import { Guilds, PlayersSeasonsArchive } from '.prisma/client';
import { fetchAchievements } from '@lib/achievements/AchievementUtils';
import { resetAllSkinsByGuildId } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { CommandInteraction, Message, MessageReaction, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Resets the game and start a new season.',
    detailedDescription: 'Resets every skins and every player in the current guild before starting a new season.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Ragnarock extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const { user } = member;
        const author = user;

        const prefix = this.container.client.options.defaultPrefix;

        const reply = await interaction.reply({
            content: `Are you sure you wish to start a new season on this server? This will remove all players acquired skins, wished skins and restart the game.\nReact to this message to accept or deny the exchange.`,
            fetchReply: true
        }) as Message;
        await reply.react('✅');
        await reply.react('🚫');

        const filter = (reaction: MessageReaction, user: User) => {
            return author.id === user.id
                && (reaction.emoji.name == '✅' || reaction.emoji.name == '🚫');
        };
        const collector = reply.createReactionCollector({ filter, time: 120000 /* 2min */ });

        collector.on('collect', async (react: MessageReaction) => {
            if (react.emoji.name === '🚫') {
                await interaction.editReply(`**${toTitleCase(this.name)} aborted.**`);
                collector.stop();
            } else if (react.emoji.name === '✅') {
                collector.stop();

                const reply = await interaction.editReply('`Starting the new season...`');

                let guild: Guilds = await this.container.prisma.guilds.findUnique({
                    where: {
                        id: guildId
                    }
                });

                const { season } = await this.startNewSeason(guild);

                await interaction.editReply(`Game has been reset.\nThe current season is now **${season}**.`);
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

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
        }, {
            guildIds: this.guildIds
        });
    }
}