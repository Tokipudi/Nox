import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectWishlistSkin, getSkinOwner, getSkinWishlist } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageActionRow } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    name: 'wishlist',
    description: 'List the cards in your wishlist.',
    usage: '[@user]',
    examples: [
        '',
        '@User#1234'
    ],
    preconditions: ['playerExists']
})
export class Wishlist extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message

        const userArgument = await args.peek('user').catch(() => author);
        if (userArgument.bot) return message.reply('Bots do not have a wishlist!');

        const player = await args.pick('player').catch(async error => {
            if (error.identifier === 'argsMissing') return await getPlayerByUserId(author.id, guildId);
        });
        if (!player) return message.reply('An error occured when trying to load the player.');

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Remove', 'DANGER');

        let skins = await getSkinWishlist(player.id);
        if (!skins || skins.length === 0) {
            return userArgument.id === author.id
                ? message.reply('Your wishlist is empty!')
                : message.reply(`${userArgument}'s wishlist is empty!`)
        }

        skins.length <= 1
            ? forwardButton.setDisabled(true)
            : forwardButton.setDisabled(false);

        const reply = await message.reply({
            content: 'Here is your wishlist.',
            embeds: [await this.generateGodSkinEmbed(skins, 0, player.id)],
            components: [
                new MessageActionRow({
                    components: userArgument.id === author.id
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
                    embeds: [await this.generateGodSkinEmbed(skins, currentIndex, player.id)],
                    components: [
                        new MessageActionRow({
                            components: userArgument.id === author.id
                                ? [...([backButton]), ...([selectButton]), ...([forwardButton])]
                                : [...([backButton]), ...([forwardButton])]
                        })
                    ]
                })
            } else if (interaction.customId === selectButton.customId && userArgument.id === author.id) {
                let skinName = interaction.message.embeds[0].title;

                let skinId = 0;
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === skinName) {
                        skinId = skins[i].id;
                        break;
                    }
                }

                let playerWishedSkin = await disconnectWishlistSkin(skinId, player.id);
                this.container.logger.info(`The card ${skinName}<${playerWishedSkin.skinId}> was removed from the wishlist of ${userArgument.username}#${userArgument.discriminator}<${userArgument.id}>!`);
                skins = await getSkinWishlist(player.id);

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
                        embeds: [await this.generateGodSkinEmbed(skins, currentIndex, player.id)],
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

    protected async generateGodSkinEmbed(skins, index, playerId: number) {
        const embed = generateSkinEmbed(skins, index);

        const owner = await getSkinOwner(skins[index].id);
        if (owner !== null) {
            const user = await this.container.client.users.fetch(owner.player.user.id);
            if (user === null) {
                embed.addField('Owner', `${owner.player.user.id}`);
            } else {
                embed.addField('Owner', `${user}`);
            }
        }

        return embed;
    }
}