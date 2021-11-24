import { setPlayerAsBanned } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Bans a player for 24h.',
    requiredUserPermissions: 'BAN_MEMBERS',
    usage: '<@user>'
})
export class Yawn extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const user = await args.peek('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await args.pick('player');
        if (!player) return message.reply('An error occured when trying to load the player.');

        await setPlayerAsBanned(player.id, 1440);

        message.reply(`${user} is banned from claiming any card for \`24 hours\`.`);
    }
}