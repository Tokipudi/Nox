import { createPlayerIfNotExists } from '@lib/database/utils/PlayersUtils';
import { disconnectWishlistSkin, getSkinOwner, getSkinWishlist } from '@lib/database/utils/SkinsUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { WrongInteractionError } from '@lib/structures/errors/WrongInteractionError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getEndButton, getForwardButton, getSelectButton, getStartButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, Snowflake, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows your wishlist or the wishlist of another player.',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists',
        'targetIsNotBanned'
    ]
})
export class Wishlist extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user as User;

        let user = interaction.options.getUser('user');
        if (user == null) {
            user = author;
        }

        const player = await createPlayerIfNotExists(user.id, guildId);
        if (player == null) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Remove', 'DANGER');
        const endButton = getEndButton();
        const startButton = getStartButton();

        let skins = await getSkinWishlist(player.id);
        if (!skins || skins.length === 0) {
            return user.id === author.id
                ? interaction.reply({
                    content: 'Your wishlist is empty!',
                    ephemeral: true
                })
                : interaction.reply({
                    content: `${user}'s wishlist is empty!`,
                    ephemeral: true
                })
        }

        if (skins.length <= 1) {
            forwardButton.setDisabled(true);
            endButton.setDisabled(true);
        } else {
            forwardButton.setDisabled(false);
            endButton.setDisabled(false);
        }

        let messageActionRows = user.id === author.id
            ? [
                new MessageActionRow({
                    components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                }),
                new MessageActionRow({
                    components: [...([selectButton])]
                })
            ]
            : [
                new MessageActionRow({
                    components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                })
            ];

        let currentIndex = 0
        const reply = await interaction.reply({
            content: `${user}'s wishlist:`,
            embeds: [await this.generateGodSkinEmbed(skins, currentIndex, guildId)],
            components: messageActionRows,
            fetchReply: true
        }) as Message;

        const collector = reply.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        });
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
                            await disconnectWishlistSkin(skin.id, player.id)
                            break;
                        }
                    }
                    if (currentIndex != 0 && currentIndex === skins.length - 1) {
                        currentIndex--;
                    }
                    skins = await getSkinWishlist(player.id);
                    break;
                default:
                    throw new WrongInteractionError({
                        interaction: interaction
                    });
            }


            if (skins == null || skins.length === 0) {
                collector.stop()
            } else {
                // Disable the buttons if they cannot be used
                startButton.disabled = currentIndex === 0;
                forwardButton.disabled = currentIndex === skins.length - 1;
                backButton.disabled = currentIndex === 0;
                endButton.disabled = currentIndex >= skins.length - 1;

                messageActionRows = user.id === author.id
                    ? [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        }),
                        new MessageActionRow({
                            components: [...([selectButton])]
                        })
                    ]
                    : [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        })
                    ];
                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [await this.generateGodSkinEmbed(skins, currentIndex, guildId)],
                    components: messageActionRows
                })
            }
        });

        collector.on('end', collected => {
            if (skins == null || skins.length === 0) {
                reply.edit({
                    content: 'Your wishlist is now empty!',
                    embeds: [],
                    components: []
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
                    description: 'The user you want to check the wishlist of. Defaults to the current user if not specified.',
                    required: false,
                    type: 'USER'
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