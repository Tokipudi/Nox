import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';
import { addSkinToWishlistByUserId, getUnclaimedSkins } from '@lib/database/utils/SkinsUtils';

@ApplyOptions<CommandOptions>({
    description: 'Checks the amount of skins available.'
})
export class Left extends Command {

    public async run(message: Message) {
        const { author } = message;

        const skins = await getUnclaimedSkins();
        
        return message.reply(`There are still ${skins.length} skins available for grab!`);
    }
}