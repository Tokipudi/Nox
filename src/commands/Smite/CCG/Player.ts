import { getGuildById } from '@lib/database/utils/GuildsUtils';
import { createPlayerIfNotExists, getPlayerSeasonArchive } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { PlayerSeasonArchiveNotFoundError } from '@lib/structures/errors/PlayerSeasonArchiveNotFoundError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { Players } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows a player\'s statistics.',
    preconditions: [
        'guildIsActive',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Player extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user as User;

        let user = interaction.options.getUser('user');
        if (user == null) {
            user = author;
        }

        const player = await createPlayerIfNotExists(user.id, guildId);
        if (player == null) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        let season = interaction.options.getNumber('season');
        const guild = await getGuildById(guildId);

        let embed = null;
        if (season == null || season == guild.season) {
            embed = await this.getCurrentSeasonEmbed(user, player, guild.season)
        } else {
            embed = await this.getPastSeasonEmbed(user, player, season);
        }

        return interaction.reply({ embeds: [embed] });
    }

    private async getCurrentSeasonEmbed(user: User, player: Players, season: number) {
        const skins = await getSkinsByPlayer(player.id);

        let favoriteSkin = null;
        for (const skin of skins) {
            if (skin.playersSkins[0].isFavorite) {
                favoriteSkin = skin;
                break;
            }
        }

        const embed = new MessageEmbed()
            .setAuthor({
                name: `${user.username}#${user.discriminator}`,
                iconURL: user.displayAvatarURL()
            })
            .setTitle(`Season ${season} *(current)*`)
            .setDescription(`Tokens: \`${player.tokens}\``)
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp(player.joinDate)
            .setFooter({
                text: `#${player.id}`
            });

        if (favoriteSkin !== null) {
            embed.setImage(favoriteSkin.godSkinUrl);
        }

        embed.addField(
            'Cards',
            `Rolled: \`${player.rolls}\`\n` +
            `Claimed: \`${player.claimedCards}\`\n` +
            `Stolen: \`${player.cardsStolen}\`\n` +
            `Given: \`${player.cardsGiven}\`\n` +
            `Received: \`${player.cardsReceived}\`\n` +
            `Exchanged: \`${player.cardsExchanged}\``,
            true
        );

        let fightDescription =
            `Wins: \`${player.win}\`\n` +
            `Losses: \`${player.loss}\`\n` +
            `Highest Winning Streak: \`${player.highestWinningStreak}\`\n` +
            `Highest Losing Streak: \`${player.highestLosingStreak}\`\n` +
            `All Ins Won: \`${player.allInWins}\`\n` +
            `All Ins Lost: \`${player.allInLoss}\`\n`;

        if (player.win > 0 || player.loss > 0) {
            fightDescription += `Winrate: \`${Math.round(((player.win / (player.win + player.loss)) * 100))}%\`\n`;
        }
        if (player.losingStreak > 0) {
            fightDescription += `Current Losing Streak: \`${player.losingStreak}\`\n`;
        }
        if (player.winningStreak > 0) {
            fightDescription += `Current Winning Streak: \`${player.winningStreak}\`\n`;
        }

        embed.addField('Fights', fightDescription, true);

        return embed;
    }

    private async getPastSeasonEmbed(user: User, player: Players, season: number) {
        const playerSeasonsArchive = await getPlayerSeasonArchive(player.id, season);
        if (playerSeasonsArchive == null) {
            throw new PlayerSeasonArchiveNotFoundError({
                playerId: player.id,
                season: season
            });
        }

        const favoriteSkin = playerSeasonsArchive.favoriteSkinId != null
            ? await this.container.prisma.skins.findUnique({
                where: {
                    id: playerSeasonsArchive.favoriteSkinId
                }
            })
            : null;

        const embed = new MessageEmbed()
            .setAuthor({
                name: `${user.username}#${user.discriminator}`,
                iconURL: user.displayAvatarURL()
            })
            .setTitle(`Season ${season}`)
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp(playerSeasonsArchive.archiveDate)
            .setFooter({
                text: `#${player.id}`
            });

        if (favoriteSkin !== null) {
            embed.setImage(favoriteSkin.godSkinUrl);
        }

        embed.addField(
            'Cards',
            `Rolled: \`${playerSeasonsArchive.rolls}\`\n` +
            `Claimed: \`${playerSeasonsArchive.claimedCards}\`\n` +
            `Stolen: \`${playerSeasonsArchive.cardsStolen}\`\n` +
            `Given: \`${playerSeasonsArchive.cardsGiven}\`\n` +
            `Received: \`${playerSeasonsArchive.cardsReceived}\`\n` +
            `Exchanged: \`${playerSeasonsArchive.cardsExchanged}\``,
            true
        );

        let fightDescription =
            `Wins: \`${playerSeasonsArchive.win}\`\n` +
            `Losses: \`${playerSeasonsArchive.loss}\`\n` +
            `Highest Winning Streak: \`${playerSeasonsArchive.highestWinningStreak}\`\n` +
            `Highest Losing Streak: \`${playerSeasonsArchive.highestLosingStreak}\`\n` +
            `All Ins Won: \`${playerSeasonsArchive.allInWins}\`\n` +
            `All Ins Lost: \`${playerSeasonsArchive.allInLoss}\`\n`;

        if (playerSeasonsArchive.win > 0 || playerSeasonsArchive.loss > 0) {
            fightDescription += `Winrate: \`${Math.round(((playerSeasonsArchive.win / (playerSeasonsArchive.win + playerSeasonsArchive.loss)) * 100))}%\`\n`;
        }

        embed.addField('Fights', fightDescription, true);

        return embed;
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to check the statistics of. Defaults to the current user if empty.',
                    required: false,
                    type: 'USER'
                },
                {
                    name: 'season',
                    description: 'The season you wish to get the player statistics from. Defaults to the current season if empty.',
                    required: false,
                    type: 'NUMBER',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}