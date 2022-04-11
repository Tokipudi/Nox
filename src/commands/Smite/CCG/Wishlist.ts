import { createPlayerIfNotExists } from '@lib/database/utils/PlayersUtils';
import { disconnectWishlistSkin, getSkinOwner, getSkinWishlist } from '@lib/database/utils/SkinsUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { NoxPaginatedMessage } from '@lib/structures/NoxPaginatedMessage';
import { getSkinsPaginatedMessage } from '@lib/utils/smite/SkinsPaginationUtils';
import { Players } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessagePage } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Constants, Snowflake, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows your wishlist or the wishlist of another player.',
    preconditions: [
        'guildIsActive',
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

        const paginatedMessage = await this.getWishlistPaginatedMessage(skins, guildId, player, author);

        return paginatedMessage.run(interaction);
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

    protected async getWishlistPaginatedMessage(skins, guildId: Snowflake, player: Players, author: User): Promise<NoxPaginatedMessage> {
        let paginatedMessage = getSkinsPaginatedMessage(skins);

        if (player.userId === author.id) {
            paginatedMessage.addAction({
                customId: 'update-paginated-message-unwish',
                style: Constants.MessageButtonStyles.DANGER,
                type: Constants.MessageComponentTypes.BUTTON,
                label: 'Unwish',
                run: async ({ handler, collector, author, response, interaction }) => {
                    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

                    const page = handler.pages[handler.index] as PaginatedMessagePage;

                    // Typeguards
                    if ('embeds' in page && response.type === 'MESSAGE_COMPONENT') {
                        // Current embed
                        const embed = page.embeds[0];

                        const selectedSkins = skins.filter(r => r.name === embed.title && r.god.name === embed.author.name);
                        if (selectedSkins.length) {
                            await disconnectWishlistSkin(selectedSkins[0].id, player.id);
                        }

                        let index = paginatedMessage.index;
                        paginatedMessage = await this.getWishlistPaginatedMessage(
                            await getSkinWishlist(player.id),
                            guildId,
                            player,
                            author
                        );

                        if (index >= paginatedMessage.pages.length) {
                            index--;
                        }
                        paginatedMessage.setIndex(index);

                        return paginatedMessage.run(interaction);
                    }
                }
            });
        }

        for (let page of paginatedMessage.pages) {
            // Typeguard
            if ('embeds' in page) {
                const embed = page.embeds[0];

                const owner = await getSkinOwner(skins[paginatedMessage.pages.indexOf(page)].id, guildId);
                if (owner !== null) {
                    const user = await this.container.client.users.fetch(owner.player.user.id);
                    embed.description = user === null
                        ? `${owner.player.user.id}`
                        : `${user}`;
                }
            }
        }

        return paginatedMessage;
    }
}