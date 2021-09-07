import { disconnectWishlistSkinByUserId, getSkinWishlistByUserId } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Empty the wishlist of a user.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class ClearWishes extends Command {

    public async run(message: Message, args: Args) {
        const user: User = await args.pick('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        const skins = await getSkinWishlistByUserId(user.id);
        if (!skins || !skins.length) return message.reply(`${user} has no cards in their wishlist.`);

        for (let i in skins) {
            let skin = skins[i];
            await disconnectWishlistSkinByUserId(user.id, skin.id);
            this.container.logger.info(`The card ${skin.name}<${skin.id}> was removed from the wishlist of ${user.username}#${user.discriminator}<${user.id}>`);
        }

        message.reply(`The wishlist of ${user} has been emptied.`);
    }
}