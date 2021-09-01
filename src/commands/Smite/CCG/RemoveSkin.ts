import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'removeskin',
    aliases: ['remove', 'r'],
    description: 'Remove a skin from your team.'
})
export class RemoveWishSkin extends Command {

    public async run(message: Message, args) {
        const skinName: string = await args.rest('string');

        if (!skinName) return message.reply('The first argument needs to be a valid skin name!');

        skinName.trim();
        const skin = await this.container.prisma.skins.findFirst({
            where: {
                name: skinName,
                playerId: message.author.id
            }
        });
        if (!skin) return message.reply('The skin **' + skinName + '** does not exist or does not belong to you!');

        const player = await this.container.prisma.players.findUnique({
            where: {
                id: message.author.id
            }
        });
        if (!player) return message.reply('You are not registered as a player yet. Use the \`roll\` command to try and get your first skin!');

        await this.container.prisma.skins.update({
            data: {
                player: {
                    disconnect: true
                }
            },
            select: {
                id: true,
                name: true
            },
            where: {
                id: skin.id
            }
        });

        this.container.logger.info(`The skin ${skin.name}<${skin.id}> was removed from the team of ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`)
        return message.reply(`The skin **${skinName}** was successfully removed from your team!`);
    }
}