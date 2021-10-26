import { addSkinToWishlist, getSkinByGodName } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Add a skin to your wishlist and get notified when it is rolled.',
    usage: '<skin name> <god name>',
    examples: [
        'Snuggly Artemis',
        '"Nuclear Winter" Ymir',
        '"Playful Bunny" "Nu Wa"'
    ]
})
export class Wish extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;

        let skinName: string = await args.pick('string');
        skinName = toTitleCase(skinName.trim());
        if (!skinName) return message.reply('The first argument needs to be a valid card name!');

        let godName: string = await args.rest('string');
        godName = toTitleCase(godName.trim());
        if (!godName) return message.reply('The second argument needs to be a valid god name!');

        const skin = await getSkinByGodName(godName, skinName);
        if (!skin) return message.reply('The card **' + skinName + '** does not exist for the god ' + godName + '!');

        await addSkinToWishlist(author.id, guildId, skin.id);

        this.container.logger.info(`The card ${skin.name}<${skin.id}> was added to the wishlist of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The card **${skinName}** was successfully added to your wishlist!`);
    }
}