import { getGodById } from '@lib/database/utils/GodsUtils';
import { getPlayerByUserId, isSkinInWishlist } from '@lib/database/utils/PlayersUtils';
import { addSkinToWishlist, getSkinOwner, getSkinsByGodId } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'List the skins of a given god.',
    preconditions: ['playerExists']
})
export class Skins extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const godId = interaction.options.getNumber('god', true);
        const god = await getGodById(godId);

        const player = await getPlayerByUserId(author.id, guildId);

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Wish', 'SUCCESS');

        let skins = await getSkinsByGodId(godId);

        let currentIndex = 0

        selectButton.disabled = await isSkinInWishlist(skins[currentIndex].id, player.id);

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await interaction.reply({
            content: `Here are the cards for ${god.name}.`,
            embeds: [await this.generateGodSkinEmbed(skins, currentIndex, player.id)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin ? [...([selectButton])] : [...([backButton]), ...([selectButton]), ...([forwardButton])]
                })
            ],
            fetchReply: true
        }) as Message;

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })
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
                selectButton.disabled = await isSkinInWishlist(skins[currentIndex].id, player.id);

                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [await this.generateGodSkinEmbed(skins, currentIndex, player.id)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })
            } else if (interaction.customId === selectButton.customId) {
                let skinName = interaction.message.embeds[0].title;

                let skinId = 0;
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === skinName) {
                        skinId = skins[i].id;
                        break;
                    }
                }


                let playerWishedSkin = await addSkinToWishlist(player.id, skinId);
                this.container.logger.debug(`The card ${skinName}<${playerWishedSkin.skinId}> was added to the wishlist of ${author.username}#${author.discriminator}<${author.id}>!`);

                // Disable the wish button
                selectButton.disabled = true;
                await interaction.update({
                    embeds: [await this.generateGodSkinEmbed(skins, currentIndex, player.id)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })
            }
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'god',
                    description: 'The god you want to check the skins of.',
                    required: true,
                    type: 'NUMBER',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: [
                '890643277081092117', // Nox Local
                '890917187412439040', // Nox Local 2
                '310422196998897666', // Test Bot
                // '451391692176752650' // The Church
            ]
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