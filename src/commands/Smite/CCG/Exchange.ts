import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'exchange',
    description: 'Exchanges a skin you own to a user of your choice. The specified user will have to validate the exchange with the same command.'
})
export class Exchange extends Command {

    public async run(message: Message, args) {
        const user: User = await args.pick('user');
        let skinName: string = await args.rest('string');
        skinName = toTitleCase(skinName);

        if (!user) return message.reply('The first argument **must** be a user.');
        if (user.id === message.author.id) return message.reply('You cannot exchange a skin with yourself!');
        if (user.bot) return message.reply('You cannot exchange a skin with a bot!');
        if (!skinName) return message.reply('The second argument needs to be a valid skin name!');

        skinName.trim();
        const skin = await this.container.prisma.skins.findFirst({
            where: {
                name: skinName,
                playerId: message.author.id
            }
        });
        if (!skin) return message.reply('The skin **' + skinName + '** does not exist or does not belong to you!');

        let player = await this.container.prisma.players.findUnique({
            where: {
                id: user.id
            }
        });
        if (!player) return message.reply(`${user} is not registered as a user. They first need to add a skin to their collection to be able to exchange with you!`);

        const prefix = this.container.client.options.defaultPrefix;
        let reply = await message.reply(`${user} An exchange has been started.\u200B` +
            `You can accept the exchange the following way \`` + prefix + `accept <skin name>\` `
            + `or deny it with \`` + prefix + `deny\``);

        const filter = (m: Message) => {
            return m.author.id === user.id && (m.content.startsWith(`${prefix}accept`) || m.content.startsWith(`${prefix}deny`));
        };
        const collector = message.channel.createMessageCollector({ filter, time: 300000 });

        let isValidated = false;
        collector.on('collect', async (m: Message) => {
            if (m.content.startsWith(`${prefix}deny`)) {
                message.reply(`${user} has rejected your exchange offer.`)
                isValidated = true;
                collector.stop();
            } else if (m.content.startsWith(`${prefix}accept`)) {
                let skinNameToExchange = m.content.replace(`${prefix}accept`, '').trim();
                let skinToExchange = await this.container.prisma.skins.findFirst({
                    where: {
                        name: skinNameToExchange,
                        playerId: m.author.id
                    }
                });
                if (!skinToExchange) {
                    m.reply('The skin **' + skinNameToExchange + '** does not exist or does not belong to you!');
                } else {
                    await this.container.prisma.skins.update({
                        data: {
                            player: {
                                connect: {
                                    id: message.author.id
                                }
                            }
                        },
                        where: {
                            id: skinToExchange.id
                        }
                    });
                    await this.container.prisma.skins.update({
                        data: {
                            player: {
                                connect: {
                                    id: user.id
                                }
                            }
                        },
                        where: {
                            id: skin.id
                        }
                    });

                    this.container.logger.info(`The skin ${skin.name}<${skin.id}> was exchanged to ${user.username}#${user.discriminator}<${user.id}> and the skin ${skinToExchange.name}<${skinToExchange.id}> was exchanged to ${message.author.username}#${message.author.discriminator}<${message.author.id}>!`)
                    message.reply(`${message.author} The skin **${skinName}** was successfully exchanged against **${skinNameToExchange}** with ${user}!`);

                    isValidated = true;
                    collector.stop();
                }
            }
        });

        collector.on('end', collected => {
            if (!isValidated) {
                reply.edit(`${user} did not give an answer. The exchange has been closed.`);
            }
        });
    }
}