import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';
import { addSkinToWishlistByUserId } from '@lib/database/utils/SkinsUtils';

@ApplyOptions<CommandOptions>({
    name: 'wish',
    description: 'Add a skin to your wishlist and get notified when it is rolled.'
})
export class Wish extends Command {

    public async run(message: Message, args: Args) {
        const { author } = message;
        let skinName: string = await args.rest('string');
        
        skinName = toTitleCase(skinName.trim());
        if (!skinName) return message.reply('The first argument needs to be a valid skin name!');

        const skin = await this.container.prisma.skins.findFirst({
            where: {
                name: skinName
            }
        });
        if (!skin) return message.reply('The skin **' + skinName + '** does not exist!');

        await addSkinToWishlistByUserId(author.id, skin.name);

        this.container.logger.info(`The skin ${skin.name}<${skin.id}> was added to the wishlist of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The skin **${skinName}** was successfully added to your wishlist!`);
    }
}