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
        let skinName: string = await args.rest('string');

        if (!skinName) return message.reply('The first argument needs to be a valid skin name!');

        skinName = toTitleCase(skinName.trim());
        const skin = await this.container.prisma.skins.findFirst({
            where: {
                name: skinName,
                playerId: author.id
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!skin) return message.reply('The skin **' + skinName + '** does not exist or does not belong to you!');

        await disconnectSkinById(skin.id);

        this.container.logger.info(`The skin ${skin.name}<${skin.id}> was removed from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The skin **${skinName}** was successfully removed from your team!`);
    }
}