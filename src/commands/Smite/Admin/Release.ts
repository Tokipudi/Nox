import { disconnectSkinById, getSkinByGodName } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Releases a skin.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Release extends Command {

    public async run(message: Message, args: Args) {
        let godName: string = await args.pick('string');
        godName = godName.trim();
        if (!godName) return message.reply('The first argument needs to be a valid god name!');

        let skinName: string = await args.rest('string');
        skinName = skinName.trim();
        if (!skinName) return message.reply('The second argument needs to be a valid skin name!');

        const skin = await getSkinByGodName(godName, skinName);
        if (!skin) return message.reply(`${skinName} is not a valid skin name!`);

        await disconnectSkinById(skin.id);

        message.reply(`The skin **${skinName} ${godName}** was released.`);
    }
}