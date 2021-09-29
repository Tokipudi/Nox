import { disconnectSkin, getSkinByGodName } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Releases a card from a user\'s collection.',
    requiredUserPermissions: 'KICK_MEMBERS'
})
export class Release extends Command {

    public async run(message: Message, args: Args) {
        let skinName: string = await args.pick('string');
        skinName = skinName.trim();
        if (!skinName) return message.reply('The first argument needs to be a valid card name!');

        let godName: string = await args.rest('string');
        godName = godName.trim();
        if (!godName) return message.reply('The second argument needs to be a valid god name!');

        const skin = await getSkinByGodName(godName, skinName);
        if (!skin) return message.reply(`**${skinName}** is not a valid card name!`);

        await disconnectSkin(skin.id, message.guildId);

        message.reply(`The card **${skinName} ${godName}** was released.`);
    }
}