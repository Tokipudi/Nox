import { disconnectSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Releases a card from a user\'s collection.',
    detailedDescription: 'Releases a card from a user\'s collection. It can then be rolled and claimed again.',
    requiredUserPermissions: 'BAN_MEMBERS',
    usage: '<skin name> <god name>',
    examples: [
        'Snuggly Artemis',
        '"Nuclear Winter" Ymir',
        '"Playful Bunny" "Nu Wa"'
    ]
})
export class Release extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        let skinName: string = await args.pick('string');
        skinName = skinName.trim();
        if (!skinName) return message.reply('The first argument needs to be a valid card name!');

        let godName: string = await args.rest('string');
        godName = godName.trim();
        if (!godName) return message.reply('The second argument needs to be a valid god name!');

        const skin = await this.container.prisma.skins.findFirst({
            where: {
                name: toTitleCase(skinName),
                god: {
                    name: toTitleCase(godName)
                }
            },
            include: {
                playersSkins: {
                    include: {
                        player: {
                            select: {
                                id: true,
                            }
                        }
                    }
                }
            }
        });
        if (!skin) return message.reply(`**${skinName}** is not a valid card name!`);
        if (skin.playersSkins.length <= 0) return message.reply(`${skinName} does not belong to anyone on this server!`);

        await disconnectSkin(skin.id, skin.playersSkins[0].player.id);

        message.reply(`The card **${skinName} ${godName}** was released.`);
    }
}