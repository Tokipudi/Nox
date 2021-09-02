import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'wish',
    description: 'Add a skin to your wishlist and get notified when it is rolled.'
})
export class Wish extends Command {

    public async run(message: Message, args) {
        let skinName: string = await args.rest('string');
        skinName = toTitleCase(skinName);

        if (!skinName) return message.reply('The first argument needs to be a valid skin name!');

        skinName.trim();
        const skin = await this.container.prisma.skins.findFirst({
            where: {
                name: skinName
            }
        });
        if (!skin) return message.reply('The skin **' + skinName + '** does not exist!');

        const player = await this.container.prisma.players.findUnique({
            where: {
                id: message.author.id
            }
        });
        if (!player) {
            await this.container.prisma.players.create({
                data: {
                    id: message.author.id,
                    wishedSkins: {
                        connect: {
                            id: skin.id
                        }
                    }
                }
            });
        } else {
            await this.container.prisma.skins.update({
                data: {
                    wishedByPlayer: {
                        connect: {
                            id: message.author.id
                        }
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
        }

        this.container.logger.info(`The skin ${skin.name}<${skin.id}> was added to the wishlist of ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`)
        return message.reply(`The skin **${skinName}** was successfully added to your wishlist!`);
    }
}