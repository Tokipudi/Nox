import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'exchange',
    description: 'Exchanges a skin you own to a user of your choice. The specified user will have to validate the exchange with the same command.'
})
export class Exchange extends Command {

    public async run(message: Message, args: Args) {
        const user: User = await args.rest('user');

        if (!user) return message.reply('The first argument **must** be a user.');
        if (user.id === message.author.id) return message.reply('You cannot exchange a skin with yourself!');
        if (user.bot) return message.reply('You cannot exchange a skin with a bot!');

        // Constants
        const backId = 'back'
        const forwardId = 'forward'
        const selectId = 'select';
        const backButton = new MessageButton({
            style: 'SECONDARY',
            label: '',
            emoji: '⬅️',
            customId: backId
        })
        const forwardButton = new MessageButton({
            style: 'SECONDARY',
            label: '',
            emoji: '➡️',
            customId: forwardId
        })
        const selectButton = new MessageButton({
            style: 'SUCCESS',
            label: 'Select',
            customId: selectId
        })

        const { author } = message
        const skins1 = await this.getSkins(message.author);
        if (!skins1 || skins1.length === 0) {
            return message.reply('You currently don\'t own any skin!');
        }
        const skins2 = await this.getSkins(user);
        if (!skins2 || skins2.length === 0) {
            return message.reply(`${user} does not own any skin!`);
        }

        /**
         * Creates an embed with skins starting from an index.
         * @param {number} index The index to start from.
         * @returns {Promise<MessageEmbed>}
         */
        const generateEmbed = async (skins, index) => {
            const skin = skins[index];

            return new MessageEmbed()
                .setTitle(skin.name)
                .setDescription(`${skin.obtainabilityName} skin`)
                .setAuthor(skin.godName, skin.godIconUrl)
                .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
                .setImage(skin.godSkinUrl)
                .setFooter(`Showing skin ${index + 1} out of ${skins.length}`);
        }

        // Send the embed with the first skin
        let uniqueSkin = skins1.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Select the skin you wish to exchange.',
            embeds: [await generateEmbed(skins1, 0)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin ? [...([selectButton])] : [...([selectButton]), ...([forwardButton])]
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
        let currentIndex = 0
        collector1.on('collect', async interaction => {
            // Increase/decrease index
            switch (interaction.customId) {
                case backId:
                    currentIndex -= 1;
                    break;
                case forwardId:
                    currentIndex += 1;
                    break;
                case selectId:
                    skinName1 = interaction.message.embeds[0].title;
                    await interaction.update({
                        content: `Select the skin you wish to get from ${user}`,
                        embeds: [],
                        components: []
                    });
                    collector1.stop();
                    break;
            }

            if (interaction.customId === backId || interaction.customId === forwardId) {
                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [await generateEmbed(skins1, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: [
                                // back button if it isn't the start
                                ...(currentIndex ? [backButton] : []),
                                ...([selectButton]),
                                // forward button if it isn't the end
                                ...(currentIndex + 1 < skins1.length ? [forwardButton] : [])
                            ]
                        })
                    ]
                })
            }
        });

        collector1.on('end', async collected => {
            uniqueSkin = skins2.length <= 1;
            const embedMessage2 = await embedMessage1.edit({
                content: `Select the skin you wish to get from ${user}.`,
                embeds: [await generateEmbed(skins2, 0)],
                components: [
                    new MessageActionRow({
                        components: uniqueSkin ? [...([selectButton])] : [...([selectButton]), ...([forwardButton])]
                    })
                ]
            })

            // Collect button interactions (when a user clicks a button),
            // but only when the button as clicked by the original message author
            const collector2 = embedMessage2.createMessageComponentCollector({
                filter: ({ user }) => user.id === author.id
            })

            currentIndex = 0
            collector2.on('collect', async interaction => {
                // Increase/decrease index
                switch (interaction.customId) {
                    case backId:
                        currentIndex -= 1;
                        break;
                    case forwardId:
                        currentIndex += 1;
                        break;
                    case selectId:
                        skinName2 = interaction.message.embeds[0].title;
                        await interaction.update({
                            content: `An exchange was started between ${author}'s **${skinName1}** and ${user}'s **${skinName2}**. Type \`${this.container.client.options.defaultPrefix}accept\` to agree to the exchange, or \`${this.container.client.options.defaultPrefix}deny\` otherwise.`,
                            embeds: [],
                            components: []
                        });
                        await user.send('A user started an exchange with you! ' + embedMessage2.url);
                        collector2.stop();
                        break;
                }

                if (interaction.customId === backId || interaction.customId === forwardId) {
                    // Respond to interaction by updating message with new embed
                    await interaction.update({
                        embeds: [await generateEmbed(skins2, currentIndex)],
                        components: [
                            new MessageActionRow({
                                components: [
                                    // back button if it isn't the start
                                    ...(currentIndex ? [backButton] : []),
                                    // select button to chose the skin to exchange
                                    ...([selectButton]),
                                    // forward button if it isn't the end
                                    ...(currentIndex + 1 < skins2.length ? [forwardButton] : [])
                                ]
                            })
                        ]
                    })
                }
            });

            collector2.on('end', async collected => {
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
                        for (let i = 0; i < skins1.length; i++) {
                            if (skins1[i].name === skinName1) {
                                skinId1 = skins1[i].id;
                                break;
                            }
                        }

                        let skinId2 = 0;
                        for (let i = 0; i < skins2.length; i++) {
                            if (skins2[i].name === skinName2) {
                                skinId2 = skins2[i].id;
                                break;
                            }
                        }

                        if (skinId1 && skinId2) {
                            await this.container.prisma.skins.update({
                                data: {
                                    player: {
                                        connect: {
                                            id: message.author.id
                                        }
                                    }
                                },
                                where: {
                                    id: skinId2
                                }
                            });
                            await this.container.prisma.skins.update({
                                data: {
                                    player: {
                                        connect: {
                                            id: user.id
                                        }
                                    }
                                },
                                where: {
                                    id: skinId1
                                }
                            });

                            this.container.logger.info(`The skin ${skinName1}<${skinId1}> was exchanged to ${user.username}#${user.discriminator}<${user.id}> and the skin ${skinName2}<${skinId2}> was exchanged to ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`)
                            message.reply(`${message.author} The skin **${skinName1}** was successfully exchanged against **${skinName2}** with ${user}!`);
                            collector3.stop();
                        }
                    }
                });

                collector3.on('end', collected => {
                    if (!isValidated) {
                        message.edit(`${user} did not give an answer. The exchange has been closed.`);
                    }
                })
            });
        });
    }

    protected async getSkins(user: User) {
        return await this.container.prisma.$queryRaw(
            'SELECT Skins.*, Gods.name as godName, SkinObtainability.name as obtainabilityName ' +
            'FROM Skins, Gods, SkinObtainability ' +
            'WHERE Skins.godId = Gods.id ' +
            'AND Skins.obtainabilityId = SkinObtainability.id ' +
            'AND Skins.playerId = "' + user.id + '" ' +
            'ORDER BY Skins.name;'
        );
    }
}