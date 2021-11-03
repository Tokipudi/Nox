import { SetFavoriteSkin } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin, getSkinsByUser, getTimeLeftBeforeExhaustEnd } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getFavoriteButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageActionRow, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Lists the cards for the given user.',
    detailedDescription: 'Lists the cards for the given user. Defaults to the message\'s author if none specified.',
    usage: '<@user>',
    examples: [
        '',
        '@User#1234'
    ]
})
export class Team extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message
        const user: User = await args.pick('user').catch(() => author);

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const favoriteButton = getFavoriteButton();
        const selectButton = getSelectButton('Fire', 'DANGER');

        const skins = await getSkinsByUser(user.id, guildId);
        if (!skins || skins.length === 0) {
            return message.reply(`${user} currently does not own any card!`);
        }


        if (skins[0].playersSkins[0].isFavorite) {
            favoriteButton.setEmoji('💔');
        } else {
            favoriteButton.setEmoji('❤️');
        }

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
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
            ]
        })

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

                const embed = await this.generateEmbed(skins, currentIndex, message.guildId);
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
                const embed = await this.generateEmbed(skins, currentIndex, message.guildId);

                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === embed.title && skins[i].god.name === embed.author.name) {
                        await SetFavoriteSkin(skins[i].id, author.id, guildId);
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
                let skin = await disconnectSkin(skinId, guildId);

                this.container.logger.info(`The card ${skinName}<${skin.id}> was fired from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
                embedMessage1.edit({
                    content: `The card **${skinName}** was successfully fired from your team!`,
                    embeds: [],
                    components: []
                });
            }
        });
    }

    protected async generateEmbed(skins, index, guildId) {
        const embed = generateSkinEmbed(skins, index);

        const skin = skins[index];

        if (skin.playersSkins[0].win || skin.playersSkins[0].loss) {
            const win = skin.playersSkins[0].win;
            const loss = skin.playersSkins[0].loss;
            const ratio = (win / (win + loss)) * 100;

            embed.addField('Wins', `\`${win}\``, true);
            embed.addField('Loss', `\`${loss}\``, true);
            embed.addField('Win rate', `\`${ratio}%\``, true);
        }

        if (skin.playersSkins[0].isExhausted) {
            const duration = await getTimeLeftBeforeExhaustEnd(skin.id, guildId);
            embed.addField('Exhausted', `Available in \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\`.`);
        }

        return embed;
    }
}