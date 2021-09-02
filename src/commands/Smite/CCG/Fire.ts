import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'fire',
    description: 'Fire a skin from your team.'
})
export class Fire extends Command {

    public async run(message: Message, args) {
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
            style: 'DANGER',
            label: 'Fire',
            customId: selectId
        })

        const { author } = message
        const skins = await this.getSkins(message.author);
        if (!skins || skins.length === 0) {
            return message.reply('You currently don\'t own any skin!');
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
                .setDescription(`${skin.obtainability.name} skin`)
                .setAuthor(skin.god.name, skin.godIconUrl)
                .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
                .setImage(skin.godSkinUrl)
                .setFooter(`Showing skin ${index + 1} out of ${skins.length}`);
        }

        // Send the embed with the first skin
        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Select the skin you wish to exchange.',
            embeds: [await generateEmbed(skins, 0)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin ? [...([selectButton])] : [...([selectButton]), ...([forwardButton])]
                })
            ]
        })

        // Collect button interactions (when a user clicks a button),
        // but only when the button as clicked by the original message author
        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        let skinName = '';
        let currentIndex = 0
        collector.on('collect', async interaction => {
            // Increase/decrease index
            switch (interaction.customId) {
                case backId:
                    currentIndex -= 1;
                    break;
                case forwardId:
                    currentIndex += 1;
                    break;
                case selectId:
                    skinName = interaction.message.embeds[0].title;
                    await interaction.update({
                        content: `You selected **${skinName}**`,
                        embeds: [],
                        components: []
                    });
                    collector.stop();
                    break;
            }

            if (interaction.customId === backId || interaction.customId === forwardId) {
                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [await generateEmbed(skins, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: [
                                // back button if it isn't the start
                                ...(currentIndex ? [backButton] : []),
                                ...([selectButton]),
                                // forward button if it isn't the end
                                ...(currentIndex + 1 < skins.length ? [forwardButton] : [])
                            ]
                        })
                    ]
                })
            }
        });

        collector.on('end', async collected => {
            let skin = await this.container.prisma.skins.update({
                data: {
                    player: {
                        disconnect: true
                    }
                },
                select: {
                    id: true,
                    name: true
                },
                where: {
                    name: skinName
                }
            });

            this.container.logger.info(`The skin ${skinName}<${skin.id}> was removed from the team of ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`)
            message.reply(`The skin **${skinName}** was successfully removed from your team!`);
        });
    }

    protected async getSkins(user: User) {
        return await this.container.prisma.skins.findMany({
            where: {
                playerId: user.id
            },
            include: {
                god: {
                    select: {
                        name: true
                    }
                },
                obtainability: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                god: {
                    name: 'asc'
                }
            }
        });
    }
}