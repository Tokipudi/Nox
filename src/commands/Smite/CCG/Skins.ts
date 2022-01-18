import { getGodByName } from '@lib/database/utils/GodsUtils';
import { getPlayerByUserId, isSkinInWishlist } from '@lib/database/utils/PlayersUtils';
import { addSkinToWishlist, disconnectWishlistSkin, getSkinOwner, getSkinsByGodId } from '@lib/database/utils/SkinsUtils';
import { QueryNotFoundError } from '@lib/structures/errors/QueryNotFoundError';
import { WrongInteractionError } from '@lib/structures/errors/WrongInteractionError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getEndButton, getForwardButton, getRemoveFromWishlistButton, getSelectButton, getStartButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, Snowflake } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'List the skins of a given god.',
    preconditions: ['playerExists']
})
export class Skins extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const godName = interaction.options.getString('god', true);
        const god = await getGodByName(godName);
        if (god == null) throw new QueryNotFoundError({
            query: godName
        });

        const player = await getPlayerByUserId(author.id, guildId);

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Wish', 'SUCCESS');
        const removeFromWishlistButton = getRemoveFromWishlistButton();
        const endButton = getEndButton();
        const startButton = getStartButton();

        let skins = await getSkinsByGodId(god.id);

        let currentIndex = 0

        let isSkinInPlayerWishlist = await isSkinInWishlist(skins[currentIndex].id, player.id);
        selectButton.disabled = isSkinInPlayerWishlist;
        removeFromWishlistButton.disabled = !isSkinInPlayerWishlist;

        const embedMessage1 = await interaction.reply({
            content: `Here are the cards for ${god.name}.`,
            embeds: [await this.generateGodSkinEmbed(skins, currentIndex, guildId)],
            components: [
                new MessageActionRow({
                    components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                }),
                new MessageActionRow({
                    components: [...(isSkinInPlayerWishlist ? [removeFromWishlistButton] : [selectButton])]
                })
            ],
            fetchReply: true
        }) as Message;

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })
        collector.on('collect', async interaction => {
            // Increase/decrease index
            switch (interaction.customId) {
                case startButton.customId:
                    currentIndex = 0;
                    break;
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
                case endButton.customId:
                    currentIndex = skins.length - 1;
                    break;
                case selectButton.customId:
                    for (let skin of skins) {
                        if (skin.name === interaction.message.embeds[0].title && skin.god.name === interaction.message.embeds[0].author.name) {
                            await addSkinToWishlist(player.id, skin.id)
                            break;
                        }
                    }
                    break;
                case removeFromWishlistButton.customId:
                    for (let skin of skins) {
                        if (skin.name === interaction.message.embeds[0].title && skin.god.name === interaction.message.embeds[0].author.name) {
                            await disconnectWishlistSkin(skin.id, player.id)
                            break;
                        }
                    }
                    break;
                default:
                    throw new WrongInteractionError({
                        interaction: interaction
                    });
            }

            // Disable the buttons if they cannot be used
            startButton.disabled = currentIndex === 0;
            forwardButton.disabled = currentIndex === skins.length - 1;
            backButton.disabled = currentIndex === 0;
            endButton.disabled = currentIndex >= skins.length - 1;

            isSkinInPlayerWishlist = await isSkinInWishlist(skins[currentIndex].id, player.id);
            selectButton.disabled = isSkinInPlayerWishlist;
            removeFromWishlistButton.disabled = !isSkinInPlayerWishlist;

            // Respond to interaction by updating message with new embed
            await interaction.update({
                embeds: [await this.generateGodSkinEmbed(skins, currentIndex, guildId)],
                components: [
                    new MessageActionRow({
                        components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                    }),
                    new MessageActionRow({
                        components: [...(isSkinInPlayerWishlist ? [removeFromWishlistButton] : [selectButton])]
                    })
                ]
            });
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
                    type: 'STRING',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }

    protected async generateGodSkinEmbed(skins, index, guildId: Snowflake) {
        const embed = generateSkinEmbed(skins, index);

        const owner = await getSkinOwner(skins[index].id, guildId);
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