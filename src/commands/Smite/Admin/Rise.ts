import { getPlayer, resetLastClaimDate, setPlayerAsUnbanned } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Unbans a player.',
    detailedDescription: 'Unbans a player, and/or let\'s a player claim another card again.',
    requiredUserPermissions: 'KICK_MEMBERS',
    usage: '<@user>',
    examples: [
        '@User#1234'
    ]
})
export class Rise extends NoxCommand {

    public async run(message: Message, args: Args) {
        const user: User = await args.pick('user').catch(() => message.author);
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await getPlayer(user.id, message.guildId);
        if (!player) return message.reply(`${user} has not rolled any card yet.`);

        await resetLastClaimDate(user.id, message.guildId);
        await setPlayerAsUnbanned(user.id, message.guildId);

        message.reply(`${user} can claim a card again.`);
    }
}