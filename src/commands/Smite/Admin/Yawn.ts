import { setPlayerAsBanned } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Bans a player for 24h.',
    requiredUserPermissions: 'KICK_MEMBERS',
    usage: '<@user>'
})
export class Yawn extends NoxCommand {

    public async run(message: Message, args: Args) {
        const user: User = await args.pick('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        await setPlayerAsBanned(user.id, message.guildId, 1440);

        message.reply(`${user} is banned from claiming any card for \`24 hours\`.`);
    }
}