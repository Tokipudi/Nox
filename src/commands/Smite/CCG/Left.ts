import { getUnclaimedSkins } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Checks the amount of cards available.'
})
export class Left extends Command {

    public async run(message: Message) {
        const skins = await getUnclaimedSkins();
        
        return message.reply(`There are still ${skins.length} cards available for grab!`);
    }
}