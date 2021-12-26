import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer, giveSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageActionRow } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Exchanges a card you own to a user of your choice. The specified user will have to validate the exchange with the same NoxCommand.',
    usage: '<@user>',
    examples: [
        '@User#1234'
    ],
    preconditions: ['playerExists']
})
export class Exchange extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;

        const user = await args.peek('user');

        if (!user) return message.reply('The first argument **must** be a user.');
        if (user.id === author.id) return message.reply('You cannot exchange a card with yourself!');
        if (user.bot) return message.reply('You cannot exchange a card with a bot!');

        const userPlayer = await args.pick('player');
        if (!userPlayer) return message.reply(`An error occured when trying to load ${user}'s player.`);

        const authorPlayer = await getPlayerByUserId(author.id, guildId);
        if (!authorPlayer) return message.reply(`An error occured when trying to load ${author}'s player.`);

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Select', 'SUCCESS');

        const skins1 = await getSkinsByPlayer(authorPlayer.id);
        if (!skins1 || skins1.length === 0) {
            return message.reply('You currently don\'t own any card!');
        }
        const skins2 = await getSkinsByPlayer(userPlayer.id);
        if (!skins2 || skins2.length === 0) {
            return message.reply(`${user} does not own any card!`);
        }

        // Send the embed with the first skin
        let currentIndex = 0;
        skins1.length <= 1
            ? forwardButton.setDisabled(true)
            : forwardButton.setDisabled(false);
        const embedMessage1 = await message.reply({
            content: 'Select the card you wish to exchange.',
            embeds: [generateSkinEmbed(skins1, currentIndex)],
            components: [
                new MessageActionRow({
                    components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                })
            ]
        })

        // Collect button interactions (when a user clicks a button),
        // but only when the button as clicked by the original message author
        const collector1 = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        let skinName1 = '';
        let skinName2 = '';
        collector1.on('collect', async interaction => {
            if (interaction.customId === backButton.customId || interaction.customId === forwardButton.customId) {
                // Increase/decrease index
                switch (interaction.customId) {
                    case backButton.customId:
                        if (currentIndex > 0) {
                            currentIndex -= 1;
                        }
                        break;
                    case forwardButton.customId:
                        if (currentIndex < skins1.length - 1) {
                            currentIndex += 1;
                        }
                        break;
                }

                // Disable the buttons if they cannot be used
                forwardButton.disabled = currentIndex === skins1.length - 1;
                backButton.disabled = currentIndex === 0;

                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [generateSkinEmbed(skins1, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })
            } else if (interaction.customId === selectButton.customId) {
                skinName1 = interaction.message.embeds[0].title;
                await embedMessage1.delete();
                collector1.stop();
            }
        });

        collector1.on('end', async collected => {
            if (skinName1 === '') {
                message.reply('You did not select a card. The exchange is canceled.');
            } else {
                currentIndex = 0
                backButton.setDisabled(true);
                skins2.length <= 1
                    ? forwardButton.setDisabled(true)
                    : forwardButton.setDisabled(false);
                const embedMessage2 = await message.reply({
                    content: `Select the card you wish to get from ${user}.`,
                    embeds: [generateSkinEmbed(skins2, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })

                // Collect button interactions (when a user clicks a button),
                // but only when the button as clicked by the original message author
                const collector2 = embedMessage2.createMessageComponentCollector({
                    filter: ({ user }) => user.id === author.id
                })
                collector2.on('collect', async interaction => {
                    if (interaction.customId === backButton.customId || interaction.customId === forwardButton.customId) {
                        // Increase/decrease index
                        switch (interaction.customId) {
                            case backButton.customId:
                                if (currentIndex > 0) {
                                    currentIndex -= 1;
                                }
                                break;
                            case forwardButton.customId:
                                if (currentIndex < skins2.length - 1) {
                                    currentIndex += 1;
                                }
                                break;
                        }

                        // Disable the buttons if they cannot be used
                        forwardButton.disabled = currentIndex === skins2.length - 1;
                        backButton.disabled = currentIndex === 0;

                        // Respond to interaction by updating message with new embed
                        await interaction.update({
                            embeds: [generateSkinEmbed(skins2, currentIndex)],
                            components: [
                                new MessageActionRow({
                                    components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                                })
                            ]
                        })
                    } else if (interaction.customId === selectButton.customId) {
                        skinName2 = interaction.message.embeds[0].title;
                        await embedMessage2.delete();
                        await message.channel.send(`An exchange was started between ${author}'s **${skinName1}** and ${user}'s **${skinName2}**.\nType \`${this.container.client.options.defaultPrefix}accept\` to agree to the exchange, or \`${this.container.client.options.defaultPrefix}deny\` otherwise.`);
                        collector2.stop();
                    }
                });

                collector2.on('end', async collected => {
                    if (skinName2 === '') {
                        message.reply(`You did not select a card. The exchange is canceled.`);
                    } else {
                        const prefix = this.container.client.options.defaultPrefix;
                        const filter = (m: Message) => {
                            return m.author.id === user.id && (m.content.startsWith(`${prefix}accept`) || m.content.startsWith(`${prefix}deny`));
                        };
                        const collector3 = message.channel.createMessageCollector({ filter, time: 120000 /* 2min */ });

                        let isValidated = false;
                        collector3.on('collect', async (m: Message) => {
                            if (m.content.startsWith(`${prefix}deny`)) {
                                message.reply(`${user} has rejected your exchange offer.`)
                                isValidated = true;
                                collector3.stop();
                            } else if (m.content.startsWith(`${prefix}accept`)) {
                                let skinId1 = 0;
                                let godName1 = '';
                                for (let i = 0; i < skins1.length; i++) {
                                    if (skins1[i].name === skinName1) {
                                        skinId1 = skins1[i].id;
                                        godName1 = skins1[i].god.name;
                                        break;
                                    }
                                }

                                let skinId2 = 0;
                                let godName2 = '';
                                for (let i = 0; i < skins2.length; i++) {
                                    if (skins2[i].name === skinName2) {
                                        skinId2 = skins2[i].id;
                                        godName2 = skins2[i].god.name;
                                        break;
                                    }
                                }

                                if (skinId1 && skinId2) {
                                    await giveSkin(userPlayer.id, guildId, skinId1, false)
                                    await giveSkin(authorPlayer.id, guildId, skinId2, false);
                                    await this.container.prisma.players.updateMany({
                                        data: {
                                            cardsExchanged: {
                                                increment: 1
                                            }
                                        },
                                        where: {
                                            id: {
                                                in: [userPlayer.id, authorPlayer.id]
                                            }
                                        }
                                    });


                                    this.container.logger.info(`The card ${skinName1}<${skinId1}> was exchanged to ${user.username}#${user.discriminator}<${user.id}> and the card ${skinName2}<${skinId2}> was exchanged to ${author.username}#${author.discriminator}<${author.id}>!`)
                                    message.reply(`${author} The card **${skinName1} ${godName1}** was successfully exchanged against **${skinName2} ${godName2}** with ${user}!`);
                                    isValidated = true;
                                    collector3.stop();
                                }
                            }
                        });
                    }
                });
            }
        });
    }
}