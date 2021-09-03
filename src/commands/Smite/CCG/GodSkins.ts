import { addSkinToWishlistByUserId, getSkinsByGodName, getSkinWishlistByUserId } from '@lib/database/utils/SkinsUtils';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateEmbed } from '@lib/utils/smite/SmitePaginationUtils';
import { Skins } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageActionRow } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'godskins',
    aliases: ['skins'],
    description: 'List the skins of a given god.'
})
export class GodSkins extends Command {

    public async run(message: Message, args: Args) {
        const { author } = message

        let godName: string = await args.rest('string');
        godName = toTitleCase(godName);

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Wish', 'SUCCESS');

        let skins = await getSkinsByGodName(godName);

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Here is your wishlist.',
            embeds: [generateEmbed(skins, 0)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin ? [...([selectButton])] : [...([backButton]), ...([selectButton]), ...([forwardButton])]
                })
            ]
        });

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

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
                selectButton.disabled = this.isSkinInWishlist(skins[currentIndex].name, await getSkinWishlistByUserId(author.id));

                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [generateEmbed(skins, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })
            } else if (interaction.customId === selectButton.customId) {
                let skinName = interaction.message.embeds[0].title;
                let skin = await addSkinToWishlistByUserId(author.id, skinName);
                this.container.logger.info(`The skin ${skinName}<${skin.id}> was added to the wishlist of ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`);

                // Disable the wish button
                selectButton.disabled = true;
                await interaction.update({
                    embeds: [generateEmbed(skins, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })
            }
        });
    }

    protected isSkinInWishlist(skinName: string, wishlist: Skins[]) {
        for (let i in wishlist) {
            let skin = wishlist[i];
            if (skin.name === skinName) {
                return true;
            }
        }
        return false;
    }
}