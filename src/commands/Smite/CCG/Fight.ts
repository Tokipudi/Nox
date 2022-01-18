import { getGodByName } from '@lib/database/utils/GodsUtils';
import { createPlayerIfNotExists, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { addLoss, addWin, connectSkin, disconnectSkin, exhaustSkin, getSkinsByPlayer, getTimeLeftBeforeExhaustEnd } from '@lib/database/utils/SkinsUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { getRandomIntInclusive } from '@lib/utils/Utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, MessageEmbed, MessageReaction, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Fight against another player.',
    preconditions: [
        'authorIsNotTarget',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists',
        'targetIsNotBanned'
    ]
})
export class Fight extends NoxCommand {

    private _channelIds = [];

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const userArgument = interaction.options.getUser('user', true);

        const userPlayer = await createPlayerIfNotExists(userArgument.id, guildId);
        if (!userPlayer) throw new PlayerNotLoadedError({
            userId: userArgument.id,
            guildId: guildId
        });

        const authorPlayer = await getPlayerByUserId(author.id, guildId);
        if (!authorPlayer) throw new PlayerNotLoadedError({
            userId: author.id,
            guildId: guildId
        });

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const fightButton = getSelectButton('Fight', 'SUCCESS', '⚔');
        const allInButton = getButton('allin', 'All In', 'DANGER', '💀');

        const skins1 = await getSkinsByPlayer(authorPlayer.id);
        if (!skins1 || skins1.length === 0) {
            return interaction.reply({
                content: 'You currently don\'t own any cards!',
                ephemeral: true
            });
        }
        let allExhausted = true;
        for (let i in skins1) {
            if (!skins1[i].playersSkins[0].isExhausted) {
                allExhausted = false;
                break;
            }
        }
        if (allExhausted) {
            return interaction.reply({
                content: 'All of your fighters are currently exhausted!',
                ephemeral: true
            });
        }

        const skins2 = await getSkinsByPlayer(userPlayer.id);
        if (!skins2 || skins2.length === 0) {
            return interaction.reply({
                content: `${userArgument} does not own any cards!`,
                ephemeral: true
            });
        }
        allExhausted = true;
        for (let i in skins2) {
            if (!skins2[i].playersSkins[0].isExhausted) {
                allExhausted = false;
                break;
            }
        }
        if (allExhausted) {
            return interaction.reply({
                content: `All of ${userArgument}'s cards are currently exhausted!`,
                ephemeral: true
            });
        }

        // Add channel ID to prevent multiple fights at the same time
        const runningInIndex = this._channelIds.indexOf(interaction.channel.id);
        if (runningInIndex >= 0) {
            return interaction.reply({
                content: `There is already an ongoing fight in this channel. Please try again once it is over.`,
                ephemeral: true
            });
        }

        this._channelIds.push(interaction.channel.id);

        // Send the embed with the first skin
        let currentIndex = 0;
        skins1.length <= 1
            ? forwardButton.setDisabled(true)
            : forwardButton.setDisabled(false);
        fightButton.disabled = skins1[currentIndex].playersSkins[0].isExhausted;
        allInButton.disabled = skins1[currentIndex].playersSkins[0].isExhausted;

        const embedMessage1 = await interaction.reply({
            content: 'Select your fighter.',
            embeds: [await this.generateEmbed(skins1, currentIndex, guildId)],
            components: [
                new MessageActionRow({
                    components: [...([backButton]), ...([forwardButton])]
                }),
                new MessageActionRow({
                    components: [...([fightButton]), ...([allInButton])]
                })
            ],
            fetchReply: true
        }) as Message;

        // Collect button interactions (when a user clicks a button),
        // but only when the button as clicked by the original message author
        const collector1 = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id,
            time: 120000
        })

        const player1 = await getPlayerByUserId(author.id, guildId);
        const player2 = await getPlayerByUserId(userArgument.id, guildId);

        let allIn: boolean = false;
        let skinName1 = '';
        let skinName2 = '';
        let godName1 = '';
        let godName2 = '';
        let rarity1 = '';
        let rarity2 = '';
        let god1, god2, skin1, skin2;
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
                fightButton.disabled = skins1[currentIndex].playersSkins[0].isExhausted;
                allInButton.disabled = skins1[currentIndex].playersSkins[0].isExhausted;

                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [await this.generateEmbed(skins1, currentIndex, guildId)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([forwardButton])]
                        }),
                        new MessageActionRow({
                            components: [...([fightButton]), ...([allInButton])]
                        })
                    ]
                })
            } else if (interaction.customId === fightButton.customId || interaction.customId === allInButton.customId) {
                if (interaction.customId === allInButton.customId) {
                    allIn = true;
                }
                skinName1 = interaction.message.embeds[0].title;
                godName1 = interaction.message.embeds[0].author.name;
                rarity1 = interaction.message.embeds[0].description.replace(/^\*+|\*+$/g, '');
                await interaction.reply({
                    content: `${author} You selected **${skinName1} ${godName1}**.`,
                    components: [],
                    embeds: []
                })
                collector1.stop();
            }
        });

        collector1.on('end', async collected => {
            if (skinName1 === '') {
                const errMsg = 'You did not select a fighter in the given time. The fight is canceled.';
                interaction.replied
                    ? await interaction.followUp(errMsg)
                    : await interaction.reply(errMsg);
                this._channelIds.splice(runningInIndex, 1);
            } else {
                let replyMessage = `${userArgument} You have been challenged to fight against **${skinName1} ${godName1} *(${rarity1})* ${player1.isBoosted ? ' <Boosted>' : ''}**!\nReact to this message to accept or deny the fight.`;
                if (allIn) {
                    replyMessage += `\n\n**Modifiers:** \`All In (winner takes all)\``
                }
                const reply = await interaction.channel.send(replyMessage);
                await reply.react('⚔️');
                await reply.react('🚫');

                const filter = (reaction: MessageReaction, user: User) => {
                    return user.id === userArgument.id
                        && (reaction.emoji.name == '⚔️' || reaction.emoji.name == '🚫');
                };
                const collector2 = reply.createReactionCollector({ filter, time: 120000 /* 2min */ });

                let isAboutToFight = false;
                collector2.on('collect', async (react: MessageReaction) => {
                    if (react.emoji.name === '🚫') {
                        collector2.stop();
                    } else if (react.emoji.name === '⚔️') {
                        isAboutToFight = true;
                        collector2.stop();
                    }
                });

                collector2.on('end', async collected => {
                    if (!isAboutToFight) {
                        const errMsg = `${userArgument} does not want to fight you or did not answer in time.`;
                        interaction.replied
                            ? await interaction.followUp(errMsg)
                            : await interaction.reply(errMsg);
                        this._channelIds.splice(runningInIndex, 1);
                    } else {
                        currentIndex = 0
                        backButton.setDisabled(true);
                        skins2.length <= 1
                            ? forwardButton.setDisabled(true)
                            : forwardButton.setDisabled(false);
                        fightButton.disabled = skins2[currentIndex].playersSkins[0].isExhausted;
                        allInButton.disabled = skins2[currentIndex].playersSkins[0].isExhausted;

                        const fightComponents = allIn
                            ? [...([allInButton])]
                            : [...([fightButton])];

                        const embedMessage3 = await interaction.channel.send({
                            content: `Select your fighter.`,
                            embeds: [await this.generateEmbed(skins2, currentIndex, guildId)],
                            components: [
                                new MessageActionRow({
                                    components: [...([backButton]), ...([forwardButton])]
                                }),
                                new MessageActionRow({
                                    components: fightComponents
                                })
                            ]
                        })

                        // Collect button interactions (when a user clicks a button),
                        // but only when the button as clicked by the original message author
                        const collector3 = await embedMessage3.createMessageComponentCollector({
                            filter: ({ user }) => user.id === userArgument.id,
                            time: 120000
                        });
                        collector3.on('collect', async interaction => {
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
                                fightButton.disabled = skins2[currentIndex].playersSkins[0].isExhausted;
                                allInButton.disabled = skins2[currentIndex].playersSkins[0].isExhausted;

                                // Respond to interaction by updating message with new embed
                                await interaction.update({
                                    embeds: [await this.generateEmbed(skins2, currentIndex, guildId)],
                                    components: [
                                        new MessageActionRow({
                                            components: [...([backButton]), ...([forwardButton])]
                                        }),
                                        new MessageActionRow({
                                            components: fightComponents
                                        })
                                    ]
                                });
                            } else if (interaction.customId === fightButton.customId || interaction.customId === allInButton.customId) {
                                skinName2 = interaction.message.embeds[0].title;
                                godName2 = interaction.message.embeds[0].author.name;
                                rarity2 = interaction.message.embeds[0].description.replace(/^\*+|\*+$/g, '');
                                god1 = await getGodByName(godName1);
                                god2 = await getGodByName(godName2);
                                await embedMessage3.delete();
                                const embed = this.generateFightEmbed(god1, skinName1, skinName1, skinName2, godName1, godName2, god1.health, god2.health, author);
                                await interaction.channel.send(`A fight was started between ${author}'s **${skinName1} ${godName1} *(${rarity1})${player1.isBoosted ? ' <Boosted>' : ''}*** and ${userArgument}'s **${skinName2} ${godName2} *(${rarity2})${player2.isBoosted ? ' <Boosted>' : ''}***!`);
                                await interaction.channel.send({ embeds: [embed] });
                                collector3.stop();
                            }
                        });

                        collector3.on('end', async collected => {
                            if (skinName2 === '') {
                                const errMsg = `${userArgument} you did not select a fighter in time. The fight is canceled.`;
                                interaction.replied
                                    ? await interaction.followUp(errMsg)
                                    : await interaction.reply(errMsg);
                            } else {
                                let god1Health = god1.health;
                                let god2Health = god2.health;

                                let skinId1 = 0;
                                for (let skin of skins1) {
                                    if (skin.name === skinName1 && skin.god.name === godName1) {
                                        skinId1 = skin.id;
                                        skin1 = skin;
                                        break;
                                    }
                                }

                                let skinId2 = 0;
                                for (let skin of skins2) {
                                    if (skin.name === skinName2 && skin.god.name === godName2) {
                                        skinId2 = skin.id;
                                        skin2 = skin;
                                        break;
                                    }
                                }

                                const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

                                let randomDamage = 0;
                                let randomAbility;
                                let embed;
                                while (god1Health > 0 && god2Health > 0) {
                                    await delay(4000);

                                    let playingPlayer = Math.floor(Math.random() * 2) + 1;
                                    switch (playingPlayer) {
                                        case 1:
                                            randomAbility = JSON.parse(god1['ability' + (Math.floor(Math.random() * 4) + 1)]);
                                            randomDamage = this.getRandomDamageFromMaxHealth(god1.health, skin1.obtainability.name, player1.isBoosted);
                                            god2Health -= randomDamage;
                                            if (god2Health < 0) {
                                                god2Health = 0;
                                            }
                                            embed = this.generateFightEmbed(god1, skinName1, skinName1, skinName2, godName1, godName2, god1Health, god2Health, author, randomAbility, randomDamage);
                                            await interaction.channel.send({ embeds: [embed] });
                                            break;
                                        case 2:
                                            randomAbility = JSON.parse(god2['ability' + (Math.floor(Math.random() * 4) + 1)]);
                                            randomDamage = this.getRandomDamageFromMaxHealth(god2.health, skin2.obtainability.name, player2.isBoosted);
                                            god1Health -= randomDamage;
                                            if (god1Health < 0) {
                                                god1Health = 0;
                                            }
                                            embed = this.generateFightEmbed(god2, skinName2, skinName1, skinName2, godName1, godName2, god1Health, god2Health, userArgument, randomAbility, randomDamage);
                                            await interaction.channel.send({ embeds: [embed] });
                                            break;
                                    }
                                }

                                if (god1Health > 0) {
                                    await addLoss(skinId2, player2.id);
                                    await addWin(skinId1, player1.id);

                                    await interaction.channel.send(`${author}'s **${skinName1} ${skin1.god.name}** won the fight!`);
                                    if (allIn) {
                                        const skin = await this.giveSkin(player1.id, player2.id, skinId2);
                                        await exhaustSkin(skin.id, player1.id);
                                        await interaction.channel.send(`${userArgument} the card **${skinName2} ${skin2.god.name}** was exhausted and now belongs to ${author}!`);
                                    } else {
                                        await exhaustSkin(skinId2, player2.id);
                                        await interaction.channel.send(`${userArgument} your card **${skinName2} ${skin2.god.name}** is now exhausted. You will have to wait 6 hours to use it in a fight again.`);
                                    }
                                } else {
                                    await addLoss(skinId1, player1.id);
                                    await addWin(skinId2, player2.id);
                                    await interaction.channel.send(`${userArgument}'s **${skinName2} ${skin2.god.name}** won the fight!`);
                                    if (allIn) {
                                        const skin = await this.giveSkin(player2.id, player1.id, skinId1);
                                        await exhaustSkin(skin.id, player2.id);
                                        await interaction.channel.send(`${author} the card **${skinName1} ${skin1.god.name}** was exhausted and now belongs to ${userArgument}!`);
                                    } else {
                                        await exhaustSkin(skinId1, player1.id);
                                        await interaction.channel.send(`${author} your card **${skinName1} ${skin1.god.name}** is now exhausted. You will have to wait 6 hours to use it in a fight again.`);
                                    }
                                }

                                if (player1.isBoosted) {
                                    await this.container.prisma.players.update({
                                        data: {
                                            isBoosted: false
                                        },
                                        where: {
                                            id: player1.id
                                        }
                                    });
                                }
                                if (player2.isBoosted) {
                                    await this.container.prisma.players.update({
                                        data: {
                                            isBoosted: false
                                        },
                                        where: {
                                            id: player2.id
                                        }
                                    });
                                }
                            }

                            this._channelIds.splice(runningInIndex, 1);
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
                    description: 'The user you wish to fight against.',
                    required: true,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }

    protected getRandomDamageFromMaxHealth(health: number, obtainability: string, isBoosted: boolean = false) {
        let advantage = isBoosted
            ? 0.2
            : 0;
        switch (obtainability) {
            case 'Clan Reward':
            case 'Unlimited':
                advantage += 0.2;
                break;
            case 'Limited':
                advantage += 0.15;
                break;
            case 'Exclusive':
                advantage += 0.05;
                break;
            case 'Standard':
            default:
                // Do nothing
                break;
        }
        return getRandomIntInclusive(advantage, health * 0.75);
    }

    protected generateFightEmbed(god, title, skinName1, skinName2, godName1, godName2, god1Health, god2Health, player, randomAbility = null, randomDamage = null) {
        const authorTitle = player.isBoosted
            ? title + ' (boosted)'
            : title;
        const embed = new MessageEmbed()
            .setAuthor({
                name: authorTitle,
                iconURL: god.godIconUrl
            })
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .addField(`${skinName1} ${godName1}'s health`, `\`\`\`css\n${god1Health.toString()}\n\`\`\``, true)
            .addField(`${skinName2} ${godName2}'s health`, `\`\`\`css\n${god2Health.toString()}\n\`\`\``, true)
            .setFooter({
                text: `${player.username}#${player.discriminator}`
            })
            .setColor('DARK_PURPLE')
            .setTimestamp();
        if (randomDamage !== null) {
            embed.setDescription(`*${god.name}* dealt \`${randomDamage}\` damage.`)
        }
        if (randomAbility !== null) {
            embed.setImage(randomAbility.URL)
                .setTitle(randomAbility.Summary);
        }

        return embed;
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

    protected async giveSkin(winnerId: number, loserId: number, skinId: number) {
        // Update loser
        await this.container.prisma.players.update({
            data: {
                allInLoss: {
                    increment: 1
                }
            },
            where: {
                id: loserId
            }
        });

        // Update winner
        await this.container.prisma.players.update({
            data: {
                allInWins: {
                    increment: 1
                }
            },
            where: {
                id: winnerId
            }
        });

        await disconnectSkin(skinId, loserId);
        return await connectSkin(skinId, winnerId, false);
    }
}