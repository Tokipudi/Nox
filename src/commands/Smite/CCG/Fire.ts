import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { toTitleCase } from '@sapphire/utilities';
import { disconnectSkinById } from '@lib/database/utils/SkinsUtils';

@ApplyOptions<CommandOptions>({
    description: 'Fire a skin from your team.'
})
export class Fire extends Command {

    public async run(message: Message, args: Args) {
        const { author } = message;

        let godName: string = await args.pick('string');
        godName = godName.trim();
        if (!godName) return message.reply('The first argument needs to be a valid god name!');

        let skinName: string = await args.rest('string');
        skinName = skinName.trim();
        if (!skinName) return message.reply('The second argument needs to be a valid skin name!');

        const skin = await this.container.prisma.skins.findFirst({
            where: {
                god: {
                    name: godName
                },
                name: skinName,
                playerId: author.id
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!skin) return message.reply('The skin **' + skinName + ' ' + godName + '** does not exist or does not belong to you!');

        await disconnectSkinById(skin.id);

        this.container.logger.info(`The skin ${skin.name}<${skin.id}> was removed from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The skin **${skinName}** was successfully removed from your team!`);
    }
}