import { disconnectSkinByName } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Releases a skin.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Release extends Command {

    public async run(message: Message, args: Args) {
        let skinName: string = await args.rest('string');
        skinName = skinName.trim();
        if (!skinName) return message.reply('The first argument needs to be a valid skin name!');

        await disconnectSkinByName(skinName);

        message.reply(`The skin **${skinName}** was released.`);
    }
}