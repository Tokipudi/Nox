import { disconnectWishlistSkin, getSkinWishlist } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Empty the wishlist of a user.',
    requiredUserPermissions: 'KICK_MEMBERS'
})
export class ClearWishes extends Command {

    public async run(message: Message, args: Args) {
        const user: User = await args.pick('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        const skins = await getSkinWishlist(user.id, message.guildId);
        if (!skins || !skins.length) return message.reply(`${user} has no cards in their wishlist.`);

        for (let i in skins) {
            let skin = skins[i];
            await disconnectWishlistSkin(skin.id, user.id, message.guildId);
            this.container.logger.info(`The card ${skin.name}<${skin.id}> was removed from the wishlist of ${user.username}#${user.discriminator}<${user.id}>`);
        }

        message.reply(`The wishlist of ${user} has been emptied.`);
    }
}