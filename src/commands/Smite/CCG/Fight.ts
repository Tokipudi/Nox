import { getGodByName } from '@lib/database/utils/GodsUtils';
import { exhaustSkin, getSkinsByUser } from '@lib/database/utils/SkinsUtils';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { getRandomIntInclusive } from '@lib/utils/Utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageActionRow, MessageEmbed, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Fight against another player.'
})
export class Fight extends Command {

    public async run(message: Message, args: Args) {
        const { author, guildId } = message
        const player: User = await args.rest('user');

        if (!player) return message.reply('The first argument **must** be a user.');
        if (player.id === author.id) return message.reply('You cannot fight against yourself!');
        if (player.bot) return message.reply('You cannot fight against a bot!');

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Fight', 'DANGER');

        const skins1 = await getSkinsByUser(author.id, guildId);
        if (!skins1 || skins1.length === 0) {
            return message.reply('You currently don\'t own any cards!');
        }
        let allExhausted = true;
        for (let i in skins1) {
            if (!skins1[i].playersSkins[0].isExhausted) {
                allExhausted = false;
                break;
            }
        }
        if (allExhausted) {
            return message.reply('All of your fighters are currently exhausted!');
        }

        const skins2 = await getSkinsByUser(player.id, guildId);
        if (!skins2 || skins2.length === 0) {
            return message.reply(`${player} does not own any cards!`);
        }
        allExhausted = true;
        for (let i in skins2) {
            if (!skins2[i].playersSkins[0].isExhausted) {
                allExhausted = false;
                break;
            }
        }
        if (allExhausted) {
            return message.reply(`All of ${player}'s cards are currently exhausted!`);
        }

        // Send the embed with the first skin
        let currentIndex = 0;
        skins1.length <= 1
            ? forwardButton.setDisabled(true)
            : forwardButton.setDisabled(false);
        selectButton.disabled = skins1[currentIndex].playersSkins[0].isExhausted;

        const embedMessage1 = await message.reply({
            content: 'Select your fighter.',
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
        let godName1 = '';
        let godName2 = '';
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
                selectButton.disabled = skins1[currentIndex].playersSkins[0].isExhausted;

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
                await embedMessage1.delete();
                collector1.stop();
            }
        });

        collector1.on('end', async collected => {
            if (skinName1 === '') {
                message.reply('You did not select a fighter in the given time. The fight is canceled.');
            } else {
                const reply = await message.reply(`${player} You have been challenged to a fight!\nType \`${this.container.client.options.defaultPrefix}accept\` to agree to the exchange, or \`${this.container.client.options.defaultPrefix}deny\` otherwise.`)

                const prefix = this.container.client.options.defaultPrefix;
                const filter = (m: Message) => {
                    return m.author.id === player.id && (m.content.startsWith(`${prefix}accept`) || m.content.startsWith(`${prefix}deny`));
                };
                const collector2 = message.channel.createMessageCollector({ filter, time: 120000 /* 2min */ });

                let isAboutToFight = false;
                collector2.on('collect', async (m: Message) => {
                    if (m.content.startsWith(`${prefix}deny`)) {
                        await reply.channel.send(`${player} does not want to fight you.`)
                        collector2.stop();
                    } else if (m.content.startsWith(`${prefix}accept`)) {
                        isAboutToFight = true;
                        collector2.stop();
                    }
                });

                collector2.on('end', async collected => {
                    if (!isAboutToFight) {
                        message.reply(`${player} did not answer in time. The fight is canceled.`);
                    } else {
                        currentIndex = 0
                        backButton.setDisabled(true);
                        skins2.length <= 1
                            ? forwardButton.setDisabled(true)
                            : forwardButton.setDisabled(false);
                        selectButton.disabled = skins2[currentIndex].playersSkins[0].isExhausted;

                        const embedMessage3 = await message.reply({
                            content: `Select your fighter.`,
                            embeds: [generateSkinEmbed(skins2, currentIndex)],
                            components: [
                                new MessageActionRow({
                                    components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                                })
                            ]
                        })

                        // Collect button interactions (when a user clicks a button),
                        // but only when the button as clicked by the original message author
                        const collector3 = await embedMessage3.createMessageComponentCollector({
                            filter: ({ user }) => user.id === player.id
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
                                selectButton.disabled = skins2[currentIndex].playersSkins[0].isExhausted;

                                // Respond to interaction by updating message with new embed
                                await interaction.update({
                                    embeds: [generateSkinEmbed(skins2, currentIndex)],
                                    components: [
                                        new MessageActionRow({
                                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                                        })
                                    ]
                                });
                            } else if (interaction.customId === selectButton.customId) {
                                skinName2 = interaction.message.embeds[0].title;
                                godName2 = interaction.message.embeds[0].author.name;
                                god1 = await getGodByName(godName1);
                                god2 = await getGodByName(godName2);
                                await embedMessage3.delete();
                                const embed = this.generateFightEmbed(god1, skinName1, skinName1, skinName2, godName1, godName2, god1.health, god2.health, author);
                                await message.channel.send(`A fight was started between ${author}'s **${godName1} ${skinName1}** and ${player}'s **${godName2} ${skinName2}**!`);
                                await message.channel.send({ embeds: [embed] });
                                collector3.stop();
                            }
                        });

                        collector3.on('end', async collected => {
                            if (skinName2 === '') {
                                message.channel.send(`${player} you did not select a fighter in time. The fight is canceled.`);
                            } else {
                                let god1Health = god1.health;
                                let god2Health = god2.health;

                                let skinId1 = 0;
                                for (let i = 0; i < skins1.length; i++) {
                                    if (skins1[i].name === skinName1) {
                                        skinId1 = skins1[i].id;
                                        skin1 = skins1[i];
                                        break;
                                    }
                                }

                                let skinId2 = 0;
                                for (let i = 0; i < skins2.length; i++) {
                                    if (skins2[i].name === skinName2) {
                                        skinId2 = skins2[i].id;
                                        skin2 = skins2[i];
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
                                            randomDamage = this.getRandomDamageFromMaxHealth(god1.health, skin1.obtainability.name);
                                            god2Health -= randomDamage;
                                            if (god2Health < 0) {
                                                god2Health = 0;
                                            }
                                            embed = this.generateFightEmbed(god1, skinName1, skinName1, skinName2, godName1, godName2, god1Health, god2Health, author, randomAbility, randomDamage);
                                            await message.channel.send({ embeds: [embed] });
                                            break;
                                        case 2:
                                            randomAbility = JSON.parse(god2['ability' + (Math.floor(Math.random() * 4) + 1)]);
                                            randomDamage = this.getRandomDamageFromMaxHealth(god2.health, skin2.obtainability.name);
                                            god1Health -= randomDamage;
                                            if (god1Health < 0) {
                                                god1Health = 0;
                                            }
                                            embed = this.generateFightEmbed(god2, skinName2, skinName1, skinName2, godName1, godName2, god1Health, god2Health, player, randomAbility, randomDamage);
                                            await message.channel.send({ embeds: [embed] });
                                            break;
                                    }
                                }

                                if (god1Health > 0) {
                                    await exhaustSkin(skinId2, guildId);
                                    await message.channel.send(`${author}'s **${skinName1}** won the fight!`);
                                    await message.channel.send(`${player} your card **${skinName2}** is now exhausted. You will have to wait 6 hours to use it in a fight again.`);
                                } else {
                                    await exhaustSkin(skinId1, guildId);
                                    await message.channel.send(`${player}'s **${skinName2}** won the fight!`);
                                    await message.channel.send(`${author} your card **${skinName1}** is now exhausted. You will have to wait 6 hours to use it in a fight again.`);
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    protected getRandomDamageFromMaxHealth(health: number, obtainability: string) {
        let advantage = 0;
        switch (obtainability) {
            case 'Clan Reward':
            case 'Unlimited':
                advantage = 0.2;
                break;
            case 'Limited':
                advantage = 0.15;
                break;
            case 'Exclusive':
                advantage = 0.05;
                break;
            case 'Standard':
            default:
                // Do nothing
                break;
        }
        return getRandomIntInclusive(advantage, health * 0.5);
    }

    protected generateFightEmbed(god, title, skinName1, skinName2, godName1, godName2, god1Health, god2Health, player, randomAbility = null, randomDamage = null) {
        const embed = new MessageEmbed()
            .setAuthor(title, god.godIconUrl)
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .addField(`${skinName1} ${godName1}'s health`, `\`\`\`css\n${god1Health.toString()}\n\`\`\``, true)
            .addField(`${skinName2} ${godName2}'s health`, `\`\`\`css\n${god2Health.toString()}\n\`\`\``, true)
            .setFooter(`${player.username}#${player.discriminator}`)
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
}