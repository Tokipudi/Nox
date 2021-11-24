import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Fire a card from your collection.',
    usage: '<skin name> <god name>',
    examples: [
        'Snuggly Artemis',
        '"Nuclear Winter" Ymir',
        '"Playful Bunny" "Nu Wa"'
    ],
    preconditions: ['PlayerExists']
})
export class Fire extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;

        const player = await getPlayerByUserId(author.id, guildId);

        let skinName: string = await args.pick('string');
        skinName = toTitleCase(skinName.trim());
        if (!skinName) return message.reply('The first argument needs to be a valid card name!');

        let godName: string = await args.rest('string');
        godName = toTitleCase(godName.trim());
        if (!godName) return message.reply('The second argument needs to be a valid god name!');

        const skin = await this.container.prisma.skins.findFirst({
            where: {
                god: {
                    name: godName
                },
                name: skinName,
                playersSkins: {
                    every: {
                        player: {
                            id: player.id
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!skin) return message.reply('The card **' + skinName + ' ' + godName + '** does not exist or does not belong to you!');

        await disconnectSkin(skin.id, player.id);

        this.container.logger.info(`The card ${skin.name}<${skin.id}> was removed from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The card **${skinName} ${godName}** was successfully removed from your team!`);
    }
}