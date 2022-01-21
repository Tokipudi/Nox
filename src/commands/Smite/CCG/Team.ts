import { createPlayerIfNotExists, setFavoriteSkin } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin, getSkinsByPlayer, getTimeLeftBeforeExhaustEnd } from '@lib/database/utils/SkinsUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { WrongInteractionError } from '@lib/structures/errors/WrongInteractionError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getEndButton, getFavoriteButton, getForwardButton, getSelectButton, getStartButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows your team or the team of another player.',
    preconditions: [
        'guildIsActive',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Team extends NoxCommand {

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

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const favoriteButton = getFavoriteButton();
        const selectButton = getSelectButton('Fire', 'DANGER');
        const endButton = getEndButton();
        const startButton = getStartButton();

        let skins = await getSkinsByPlayer(player.id);
        if (!skins || skins.length === 0) {
            return interaction.reply({
                content: `${user} currently does not own any card!`,
                ephemeral: true
            });
        }

        let currentIndex = 0

        skins[0].playersSkins[0].isFavorite
            ? favoriteButton.setEmoji('💔')
            : favoriteButton.setEmoji('❤️');

        const messageActionRows = user.id === author.id
            ? [
                new MessageActionRow({
                    components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                }),
                new MessageActionRow({
                    components: [...([selectButton]), ...([favoriteButton])]
                })
            ]
            : [
                new MessageActionRow({
                    components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                })
            ];

        const embedMessage1 = await interaction.reply({
            content: `${user}'s team:`,
            embeds: [await this.generateEmbed(skins, currentIndex, guildId)],
            components: messageActionRows,
            fetchReply: true
        }) as Message;

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        let skinName = '';
        let godName = '';
        collector.on('collect', async interaction => {
            // Increase/decrease index
            switch (interaction.customId) {
                case startButton.customId:
                    currentIndex = 0;
                    break;
                case backButton.customId:
                    if (currentIndex > 0) {
                        currentIndex -= 1;
                    }
                    break;
                case forwardButton.customId:
                    if (currentIndex < skins.length - 1) {
                        currentIndex += 1;
                    }
                    break;
                case endButton.customId:
                    currentIndex = skins.length - 1;
                    break;
                case selectButton.customId:
                    for (let skin of skins) {
                        if (skin.name === interaction.message.embeds[0].title && skin.god.name === interaction.message.embeds[0].author.name) {
                            await disconnectSkin(skin.id, player.id);
                            break;
                        }
                    }
                    if (currentIndex != 0 && currentIndex === skins.length - 1) {
                        currentIndex--;
                    }
                    skins = await getSkinsByPlayer(player.id)
                    break;
                case favoriteButton.customId:
                    for (let skin of skins) {
                        if (skin.name === interaction.message.embeds[0].title && skin.god.name === interaction.message.embeds[0].author.name) {
                            await setFavoriteSkin(player.id, skin.id);
                            skin.playersSkins[0].isFavorite = true;
                            favoriteButton.setEmoji('💔');
                        } else {
                            skin.playersSkins[0].isFavorite = false;
                        }
                    }
                    break;
                default:
                    throw new WrongInteractionError({
                        interaction: interaction
                    });
            }

            if (skins == null || skins.length <= 0) {
                collector.stop();
            } else {
                // Disable the buttons if they cannot be used
                startButton.disabled = currentIndex === 0;
                forwardButton.disabled = currentIndex === skins.length - 1;
                backButton.disabled = currentIndex === 0;
                endButton.disabled = currentIndex >= skins.length - 1;
                skins[currentIndex].playersSkins[0].isFavorite
                    ? favoriteButton.setEmoji('💔')
                    : favoriteButton.setEmoji('❤️');

                const messageActionRows = user.id === author.id
                    ? [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        }),
                        new MessageActionRow({
                            components: [...([selectButton]), ...([favoriteButton])]
                        })
                    ]
                    : [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        })
                    ];

                await interaction.update({
                    embeds: [await this.generateEmbed(skins, currentIndex, guildId)],
                    components: messageActionRows
                });
            }
        });

        collector.on('end', async collected => {
            if (skins == null || skins.length <= 0) {
                embedMessage1.edit({
                    content: `Your team is now empty!`,
                    embeds: [],
                    components: []
                });
            }
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to check the team of. Defaults to the current user if not specified.',
                    required: false,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }

    protected async generateEmbed(skins, index, guildId) {
        const embed = generateSkinEmbed(skins, index);

        const skin = skins[index];
        const playerSkin = skin.playersSkins[0];

        if (playerSkin.win || playerSkin.loss) {
            const win = playerSkin.win;
            const loss = playerSkin.loss;
            const ratio = Math.round((win / (win + loss)) * 100);

            if (playerSkin.losingStreak > 0) {
                embed.addField('Current Losing Streak', `\`${playerSkin.losingStreak}\``);
            }
            if (playerSkin.winningStreak > 0) {
                embed.addField('Current Winning Streak', `\`${playerSkin.winningStreak}\``);
            }

            embed.addField('Wins', `\`${win}\``, true)
                .addField('Loss', `\`${loss}\``, true)
                .addField('Win rate', `\`${ratio}%\``, true);

            if (playerSkin.highestWinningStreak || playerSkin.highestLosingStreak) {
                embed.addField('Highest Winning Streak', `\`${playerSkin.highestWinningStreak}\``, true)
                    .addField('Highest Losing Streak', `\`${playerSkin.highestLosingStreak}\``, true);
            }
        }

        if (skin.playersSkins[0].isExhausted) {
            const duration = await getTimeLeftBeforeExhaustEnd(skin.id, guildId);
            embed.addField('Exhausted', `Available in \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\`.`);
        }

        return embed;
    }
}