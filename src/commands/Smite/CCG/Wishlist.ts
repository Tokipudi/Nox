import { disconnectWishlistSkinByUserId, getSkinWishlistByUserId } from '@lib/database/utils/SkinsUtils';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageActionRow, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'wishlist',
    description: 'List the skins in your wishlist.'
})
export class Wishlist extends Command {

    public async run(message: Message, args: Args) {
        const { author } = message
        const player: User = await args.pick('user').catch(() => message.author);

        if (player) {
            if (player.bot) return message.reply('Bots do not have a wishlist!');
        }

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Remove', 'DANGER');

        let skins = await getSkinWishlistByUserId(player.id);
        if (!skins || skins.length === 0) {
            return player.id === author.id
                ? message.reply('Your wishlist is empty!')
                : message.reply(`${player}'s wishlist is empty!`)
        }

        skins.length <= 1
            ? forwardButton.setDisabled(true)
            : forwardButton.setDisabled(false);

        const reply = await message.reply({
            content: 'Here is your wishlist.',
            embeds: [generateSkinEmbed(skins, 0)],
            components: [
                new MessageActionRow({
                    components: player.id === author.id
                        ? [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        : [...([backButton]), ...([forwardButton])]
                })
            ]
        });

        const collector = reply.createMessageComponentCollector({
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

                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [generateSkinEmbed(skins, currentIndex)],
                    components: [
                        new MessageActionRow({
                            components: player.id === author.id
                                ? [...([backButton]), ...([selectButton]), ...([forwardButton])]
                                : [...([backButton]), ...([forwardButton])]
                        })
                    ]
                })
            } else if (interaction.customId === selectButton.customId && player.id === author.id) {
                let skinName = interaction.message.embeds[0].title;
                let skin = await disconnectWishlistSkinByUserId(player.id, skinName);
                this.container.logger.info(`The skin ${skinName}<${skin.id}> was removed from the wishlist of ${player.username}#${player.discriminator}<${player.id}>!`);
                skins = await getSkinWishlistByUserId(player.id);

                if (skins == null || skins.length === 0) {
                    collector.stop();
                } else {
                    // Reload the skins embed
                    if (currentIndex > 0) {
                        currentIndex -= 1;
                    }
                    // Disable the buttons if they cannot be used
                    forwardButton.disabled = currentIndex === skins.length - 1;
                    backButton.disabled = currentIndex === 0;

                    await interaction.update({
                        embeds: [generateSkinEmbed(skins, currentIndex)],
                        components: [
                            new MessageActionRow({
                                components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                            })
                        ]
                    })
                }
            }
        });

        collector.on('end', collected => {
            if (skins == null || skins.length === 0) {
                reply.edit({
                content: 'Your wishlist is empty!',
                embeds: [],
                    components: []
                });
            }
        });
    }
}