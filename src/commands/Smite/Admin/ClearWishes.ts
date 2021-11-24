import { disconnectWishlistSkin, getSkinWishlist } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Empty the wishlist of a user.',
    detailedDescription: 'Empties the wishlist of a user for the current guild.',
    requiredUserPermissions: 'BAN_MEMBERS',
    usage: '<@user>',
    examples: [
        '@User#1234'
    ]
})
export class ClearWishes extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const user = await args.peek('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await args.pick('player');
        if (!player) return message.reply('An error occured when trying to load the player.');

        const skins = await getSkinWishlist(player.id);
        if (!skins || !skins.length) return message.reply(`${user} has no cards in their wishlist.`);

        for (const skin of skins) {
            await disconnectWishlistSkin(skin.id, player.id);
            this.container.logger.info(`The card ${skin.name}<${skin.id}> was removed from the wishlist of player ${player.id}`);
        }

        message.reply(`The wishlist of ${user} has been emptied.`);
    }
}