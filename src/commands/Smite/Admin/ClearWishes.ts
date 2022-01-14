import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectWishlistSkin, getSkinWishlist } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Empties the wishlist of a user.',
    requiredUserPermissions: 'BAN_MEMBERS',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class ClearWishes extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        let user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) return interaction.reply('An error occured when trying to load the player.');

        const skins = await getSkinWishlist(player.id);
        if (!skins || !skins.length) return interaction.reply(`${user} has no cards in their wishlist.`);

        for (let skin of skins) {
            await disconnectWishlistSkin(skin.id, player.id);
        }

        return interaction.reply(`The wishlist of ${user} has been emptied.`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to clear the wishlist of.',
                    required: true,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}