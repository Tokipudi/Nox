import { getPlayerByUserId, isSkinInWishlist } from '@lib/database/utils/PlayersUtils';
import { addSkinToWishlist } from '@lib/database/utils/SkinsUtils';
import { QueryNotFoundError } from '@lib/structures/errors/QueryNotFoundError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getSkinIdFromStringParameter } from '@lib/utils/interaction-handlers/AutocompleteUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Add a skin to your wishlist and get notified when it is rolled.',
    preconditions: [
        'guildIsActive',
        'playerExists'
    ]
})
export class Wish extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const skinFullName = interaction.options.getString('skin', true);
        const skinId = await getSkinIdFromStringParameter(skinFullName);
        if (!skinId) throw new QueryNotFoundError({
            query: skinFullName
        });

        const skin = await this.container.prisma.skins.findUnique({
            where: {
                id: skinId
            },
            include: {
                god: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!skin) return interaction.reply({
            content: 'An error occured when trying to load the skin.',
            ephemeral: true
        });

        const player = await getPlayerByUserId(author.id, guildId);

        const isInWishlist = await isSkinInWishlist(skinId, player.id);
        if (isInWishlist) return interaction.reply({
            content: 'This skin already is in your wishlist.',
            ephemeral: true
        });

        await addSkinToWishlist(player.id, skin.id);

        this.container.logger.debug(`The card ${skin.name}<${skin.id}> was added to the wishlist of ${author.username}#${author.discriminator}<${author.id}>!`)
        return interaction.reply(`The card **"${skin.name}" ${skin.god.name}** was successfully added to your wishlist!`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'skin',
                    description: 'The skin you want to add to your wishlist.',
                    required: true,
                    type: 'STRING',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}