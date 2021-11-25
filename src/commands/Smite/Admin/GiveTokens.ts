import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Gives tokens to a user.',
    requiredUserPermissions: 'ADMINISTRATOR',
    usage: '<@user> <tokens>',
    examples: [
        '@User#1234 5',
        '@User#1234 12'
    ]
})
export class GiveTokens extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const user = await args.peek('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await args.pick('player');
        if (!player) return message.reply('An error occured when trying to load the player.');

        const tokens = await args.rest('number');
        if (!tokens) return message.reply('You have to specify the amount of tokens you want to give the user.');

        this.container.prisma.players.update({
            data: {
                tokens: {
                    increment: tokens
                }
            },
            where: {
                id: player.id
            }
        }).then(player => {
            message.reply(`\`${tokens}\` tokens have been given to ${user}.`);
        }).catch(e => {
            this.container.logger.error(e);
            message.reply(`An error occured when trying to execute this command.`);
        });
    }
}