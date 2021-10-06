import { disconnectSkin, getSkinByGodName } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Releases a card from a user\'s collection.',
    detailedDescription: 'Releases a card from a user\'s collection. It can then be rolled and claimed again.',
    requiredUserPermissions: 'KICK_MEMBERS',
    usage: '<skin name> <god name>',
    examples: [
        'Snuggly Artemis',
        '"Nuclear Winter" Ymir',
        '"Playful Bunny" "Nu Wa"'
    ]
})
export class Release extends NoxCommand {

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