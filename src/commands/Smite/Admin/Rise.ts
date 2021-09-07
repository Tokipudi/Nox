import { getPlayerById, resetLastClaimDate } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Lets a player claim rolls again.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Rise extends Command {

    public async run(message: Message, args: Args) {
        const user: User = await args.pick('user').catch(() => message.author);
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await getPlayerById(user.id);
        if (!player) return message.reply(`${user} has not rolled any card yet.`);

        await resetLastClaimDate(user.id);

        message.reply(`${user} can claim a card again.`);
    }
}