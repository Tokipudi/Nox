import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';
import { addSkinToWishlist, getSkinByGodName } from '@lib/database/utils/SkinsUtils';

@ApplyOptions<CommandOptions>({
    name: 'wish',
    description: 'Add a skin to your wishlist and get notified when it is rolled.'
})
export class Wish extends Command {

    public async run(message: Message, args: Args) {
        const { author, guildId } = message;

        let godName: string = await args.pick('string');
        godName = toTitleCase(godName.trim());
        if (!godName) return message.reply('The first argument needs to be a valid god name!');

        let skinName: string = await args.rest('string');
        skinName = toTitleCase(skinName.trim());
        if (!skinName) return message.reply('The second argument needs to be a valid card name!');

        const skin = await getSkinByGodName(godName, skinName);
        if (!skin) return message.reply('The card **' + skinName + '** does not exist for the god ' + godName + '!');

        await addSkinToWishlist(author.id, guildId, skin.id);

        this.container.logger.info(`The card ${skin.name}<${skin.id}> was added to the wishlist of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The card **${skinName}** was successfully added to your wishlist!`);
    }
}