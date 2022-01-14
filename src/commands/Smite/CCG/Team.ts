import { createPlayerIfNotExists, setFavoriteSkin } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin, getSkinsByPlayer, getTimeLeftBeforeExhaustEnd } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getFavoriteButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows your team or the team of another player.',
    preconditions: [
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
        if (user.bot) return await interaction.reply('You cannot use this command on a bot.');

        const player = await createPlayerIfNotExists(user.id, guildId);
        if (player == null) return interaction.reply('An error occured when trying to load the player.');

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const favoriteButton = getFavoriteButton();
        const selectButton = getSelectButton('Fire', 'DANGER');

        const skins = await getSkinsByPlayer(player.id);
        if (!skins || skins.length === 0) {
            return interaction.reply(`${user} currently does not own any card!`);
        }

        if (skins[0].playersSkins[0].isFavorite) {
            favoriteButton.setEmoji('💔');
        } else {
            favoriteButton.setEmoji('❤️');
        }

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await interaction.reply({
            content: 'Here is your team.',
            embeds: [await this.generateEmbed(skins, 0, guildId)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin
                        ? user.id === author.id
                            ? [...([selectButton]), ...([favoriteButton])]
                            : []
                        : user.id === author.id
                            ? [...([backButton]), ...([selectButton]), ...([favoriteButton]), ...([forwardButton])]
                            : [...([backButton]), ...([forwardButton])]
                })
            ],
            fetchReply: true
        }) as Message;

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        let skinName = '';
        let godName = '';
        let currentIndex = 0
        collector.on('collect', async interaction => {
            if (interaction.customId === backButton.customId || interaction.customId === forwardButton.customId) {
                // Increase/decrease index
                switch (interaction.customId) {
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
                }

                // Disable the buttons if they cannot be used
                forwardButton.disabled = currentIndex === skins.length - 1;
                backButton.disabled = currentIndex === 0;

                const embed = await this.generateEmbed(skins, currentIndex, guildId);
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === embed.title && skins[i].god.name === embed.author.name) {
                        if (skins[i].playersSkins[0].isFavorite) {
                            favoriteButton.setEmoji('💔');
                        } else {
                            favoriteButton.setEmoji('❤️');
                        }
                        break;
                    }
                }

                await interaction.update({
                    embeds: [embed],
                    components: [
                        new MessageActionRow({
                            components: user.id === author.id
                                ? [...([backButton]), ...([selectButton]), ...([favoriteButton]), ...([forwardButton])]
                                : [...([backButton]), ...([forwardButton])]
                        })
                    ]
                });
            } else if (interaction.customId === favoriteButton.customId) {
                const embed = await this.generateEmbed(skins, currentIndex, guildId);

                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === embed.title && skins[i].god.name === embed.author.name) {
                        await setFavoriteSkin(player.id, skins[i].id);
                        skins[i].playersSkins[0].isFavorite = true;
                        favoriteButton.setEmoji('💔');
                    } else {
                        skins[i].playersSkins[0].isFavorite = false;
                    }
                }
                await interaction.update({
                    embeds: [embed],
                    components: [
                        new MessageActionRow({
                            components: user.id === author.id
                                ? [...([backButton]), ...([selectButton]), ...([favoriteButton]), ...([forwardButton])]
                                : [...([backButton]), ...([forwardButton])]
                        })
                    ]
                });
            } else if (interaction.customId === selectButton.customId) {
                skinName = interaction.message.embeds[0].title;
                godName = interaction.message.embeds[0].author.name;
                collector.stop();
            }
        });

        collector.on('end', async collected => {
            if (skinName) {
                let skinId = 0;
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === skinName && skins[i].god.name === godName) {
                        skinId = skins[i].id;
                        break;
                    }
                }
                let skin = await disconnectSkin(skinId, player.id);

                this.container.logger.info(`The card ${skinName}<${skin.id}> was fired from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
                embedMessage1.edit({
                    content: `The card **${skinName}** was successfully fired from your team!`,
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