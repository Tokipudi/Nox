import { createPlayerIfNotExists, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer, giveSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, MessageReaction, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Start a trade another player.',
    preconditions: [
        'authorIsNotTarget',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists',
        'targetIsNotBanned'
    ]
})
export class Trade extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const user = interaction.options.getUser('user', true);

        const userPlayer = await createPlayerIfNotExists(user.id, guildId);
        if (!userPlayer) return interaction.reply({
            content: `An error occured when trying to load ${user}'s player.`,
            ephemeral: true
        });

        const authorPlayer = await getPlayerByUserId(author.id, guildId);
        if (!authorPlayer) return interaction.reply({
            content: `An error occured when trying to load ${author}'s player.`,
            ephemeral: true
        });

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Select', 'SUCCESS');

        const skins1 = await getSkinsByPlayer(authorPlayer.id);
        if (!skins1 || skins1.length === 0) {
            return interaction.reply({
                content: 'You currently don\'t own any card!',
                ephemeral: true
            });
        }
        const skins2 = await getSkinsByPlayer(userPlayer.id);
        if (!skins2 || skins2.length === 0) {
            return interaction.reply({
                content: `${user} does not own any card!`,
                ephemeral: true
            });
        }

        // Send the embed with the first skin
        let currentIndex = 0;
        skins1.length <= 1
            ? forwardButton.setDisabled(true)
            : forwardButton.setDisabled(false);
        const embedMessage1 = await interaction.reply({
            content: 'Select the card you wish to trade.',
            embeds: [generateSkinEmbed(skins1, currentIndex)],
            components: [
                new MessageActionRow({
                    components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                })
            ],
            fetchReply: true
        }) as Message;

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
                godName1 = interaction.message.embeds[0].author.name;
                await interaction.reply({
                    content: `You selected **${skinName1} ${godName1}**`,
                    components: [],
                    embeds: []
                });
                collector1.stop();
            }
        });

        let godName1 = '';
        let godName2 = '';
        collector1.on('end', async collected => {
            if (skinName1 === '') {
                const errMsg = `${author} You did not select a card. The trade is canceled.`;
                interaction.replied
                    ? await interaction.followUp(errMsg)
                    : await interaction.reply(errMsg);
            } else {
                currentIndex = 0
                backButton.setDisabled(true);
                skins2.length <= 1
                    ? forwardButton.setDisabled(true)
                    : forwardButton.setDisabled(false);
                const embedMessage2 = await interaction.channel.send({
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
                        godName2 = interaction.message.embeds[0].author.name;
                        await embedMessage2.delete();
                        collector2.stop();
                    }
                });

                collector2.on('end', async collected => {
                    if (skinName2 === '') {
                        const errMsg = `${author} You did not select a card. The trade is canceled.`;
                        interaction.replied
                            ? await interaction.followUp(errMsg)
                            : await interaction.reply(errMsg);
                    } else {
                        const reply = await interaction.channel.send(`A trade was started between ${author}'s **${skinName1} ${godName1}** and ${user}'s **${skinName2} ${godName2}**.\nReact to this message to accept or deny the trade.`);
                        await reply.react('✅');
                        await reply.react('🚫');

                        const filter = (reaction: MessageReaction, u: User) => {
                            return user.id === u.id
                                && (reaction.emoji.name == '✅' || reaction.emoji.name == '🚫');
                        };
                        const collector3 = reply.createReactionCollector({ filter, time: 120000 /* 2min */ });

                        let isValidated = false;
                        collector3.on('collect', async (react: MessageReaction) => {
                            if (react.emoji.name === '🚫') {
                                const errMsg = `${user} has rejected your trade offer.`;
                                interaction.replied
                                    ? await interaction.followUp(errMsg)
                                    : await interaction.reply(errMsg);
                                isValidated = true;
                                collector3.stop();
                            } else if (react.emoji.name === '✅') {
                                let skinId1 = 0;
                                for (let skin of skins1) {
                                    if (skin.name === skinName1 && skin.god.name === godName1) {
                                        skinId1 = skin.id;
                                        break;
                                    }
                                }

                                let skinId2 = 0;
                                for (let skin of skins2) {
                                    if (skin.name === skinName2 && skin.god.name === godName2) {
                                        skinId2 = skin.id;
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


                                    this.container.logger.info(`The card ${skinName1}<${skinId1}> was given to ${user.username}#${user.discriminator}<${user.id}> and the card ${skinName2}<${skinId2}> was given to ${author.username}#${author.discriminator}<${author.id}>!`)
                                    interaction.channel.send(`${author} The card **${skinName1} ${godName1}** was successfully traded against **${skinName2} ${godName2}** with ${user}!`);
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

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The you user you wish to trade with.',
                    required: true,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}