import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'giveskin',
    aliases: ['give'],
    description: 'Gives a skin you own to a user of your choice.'
})
export class GiveSkin extends Command {

    public async run(message: Message, args) {
        const user: User = await args.pick('user');
        let skinName: string = await args.rest('string');
        skinName = toTitleCase(skinName);

        if (!user) return message.reply('The first argument **must** be a user.');
        if (user.id === message.author.id) return message.reply('You cannot give yourself a skin!');
        if (user.bot) return message.reply('You cannot give a skin to a bot!');
        if (!skinName) return message.reply('The second argument needs to be a valid skin name!');

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
                id: user.id
            }
        });
        if (!player) {
            await this.container.prisma.players.create({
                data: {
                    id: user.id,
                    skins: {
                        connect: {
                            id: skin.id
                        }
                    }
                }
            });
        } else {
            await this.container.prisma.skins.update({
                data: {
                    playerId: user.id
                },
                select: {
                    id: true,
                    name: true,
                    playerId: true
                },
                where: {
                    id: skin.id
                }
            });
        }

        this.container.logger.info(`The skin ${skin.name}<${skin.id}> was given to ${user.username}#${user.discriminator}<${user.id}> by ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`)
        return message.reply(`The skin **${skinName}** was successfully given to ${user}!`);
    }
}