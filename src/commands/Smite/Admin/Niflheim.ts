import { setPlayerAsBanned } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Bans a player.',
    requiredUserPermissions: 'KICK_MEMBERS'
})
export class Rise extends Command {

    public async run(message: Message, args: Args) {
        const user: User = await args.pick('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        await setPlayerAsBanned(user.id, message.guildId);

        message.reply(`${user} is banned from claiming any card.`);
    }
}