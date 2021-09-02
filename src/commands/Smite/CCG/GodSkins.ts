import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'godskins',
    aliases: ['skins'],
    description: 'List the skins of a given god.'
})
export class GodSkins extends Command {

    public async run(message: Message, args: Args) {
        let godName: string = await args.rest('string');
        godName = toTitleCase(godName);

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
        const skins = await this.getSkins(godName);

        /**
         * Creates an embed with skins starting from an index.
         * @param {number} index The index to start from.
         * @returns {Promise<MessageEmbed>}
         */
        const generateEmbed = async index => {
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
        let uniqueSkin = skins.length <= 1;
        const embedMessage = await message.reply({
            embeds: [await generateEmbed(0)],
            components: uniqueSkin ? [] : [new MessageActionRow({ components: [forwardButton] })]
        })
        // Exit if there is only one page of skins (no need for all of this)
        if (uniqueSkin) return

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

    protected async getSkins(godName: string) {
        return await this.container.prisma.$queryRaw(
            'SELECT Skins.*, Gods.name as godName, SkinObtainability.name as obtainabilityName ' +
            'FROM Skins, Gods, SkinObtainability ' +
            'WHERE Skins.godId = Gods.id ' +
            'AND Skins.obtainabilityId = SkinObtainability.id ' +
            'AND Gods.name = "' + godName + '" ' +
            'ORDER BY Skins.id DESC;'
        );
    }
}