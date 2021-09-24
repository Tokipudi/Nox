import { disconnectSkin } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Fire a card from your collection.'
})
export class Fire extends Command {

    public async run(message: Message, args: Args) {
        const { author, guildId } = message;

        let godName: string = await args.pick('string');
        godName = godName.trim();
        if (!godName) return message.reply('The first argument needs to be a valid god name!');

        let skinName: string = await args.rest('string');
        skinName = skinName.trim();
        if (!skinName) return message.reply('The second argument needs to be a valid card name!');

        const skin = await this.container.prisma.skins.findFirst({
            where: {
                god: {
                    name: godName
                },
                name: skinName,
                playersSkins: {
                    every: {
                        userId: author.id,
                        guildId: guildId
                    }
                }
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!skin) return message.reply('The card **' + skinName + ' ' + godName + '** does not exist or does not belong to you!');

        await disconnectSkin(skin.id, guildId);

        this.container.logger.info(`The card ${skin.name}<${skin.id}> was removed from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
        return message.reply(`The card **${skinName}** was successfully removed from your team!`);
    }
}