import { Command, CommandOptions, PieceContext } from '@sapphire/framework';
import { Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

export class ListSkins extends Command {
    public constructor(context: PieceContext, options: CommandOptions) {
        super(context, {
            ...options,
            name: 'listskins',
            aliases: ['list'],
            description: 'List the skins you currently own.'
        });
    }

    public async run(message: Message, args) {
        // Constants

        const backId = 'back'
        const forwardId = 'forward'
        const backButton = new MessageButton({
            style: 'SECONDARY',
            label: 'Back',
            emoji: '⬅️',
            customId: backId
        })
        const forwardButton = new MessageButton({
            style: 'SECONDARY',
            label: 'Forward',
            emoji: '➡️',
            customId: forwardId
        })

        // Put the following code wherever you want to send the embed pages:

        const { author, channel } = message
        const skins = await this.container.prisma.$queryRaw(
            'SELECT Skins.*, Gods.name as godName, SkinObtainability.name as obtainabilityName ' +
            'FROM Skins, Gods, SkinObtainability ' +
            'WHERE Skins.godId = Gods.id ' +
            'AND Skins.obtainabilityId = SkinObtainability.id ' +
            'AND Skins.playerId = "' + message.author.id + '" ' +
            'ORDER BY Skins.name;'
        );
        if (!skins) return message.reply('You currently don\'t own any skin!');

        /**
         * Creates an embed with skins starting from an index.
         * @param {number} index The index to start from.
         * @returns {Promise<MessageEmbed>}
         */
        const generateEmbed = async index => {
            const skin = skins[index];
            
            return new MessageEmbed()
                .setTitle(skin.name)
                .setDescription(`Showing skin ${index + 1} out of ${skins.length}`)
                .setAuthor(skin.godName, skin.godIconUrl)
                .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
                .setImage(skin.godSkinUrl)
                .setFooter(`${skin.obtainabilityName} skin`);
        }

        // Send the embed with the first skin
        const embedMessage = await message.reply({
            embeds: [await generateEmbed(0)],
            components: [new MessageActionRow({ components: [forwardButton] })]
        })
        // Exit if there is only one page of skins (no need for all of this)
        if (skins.length <= 1) return

        // Collect button interactions (when a user clicks a button),
        // but only when the button as clicked by the original message author
        const collector = embedMessage.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        let currentIndex = 0
        collector.on('collect', async interaction => {
            // Increase/decrease index
            interaction.customId === backId ? (currentIndex -= 1) : (currentIndex += 1)
            // Respond to interaction by updating message with new embed
            await interaction.update({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                    new MessageActionRow({
                        components: [
                            // back button if it isn't the start
                            ...(currentIndex ? [backButton] : []),
                            // forward button if it isn't the end
                            ...(currentIndex + 1 < skins.length ? [forwardButton] : [])
                        ]
                    })
                ]
            })
        })
    }
}