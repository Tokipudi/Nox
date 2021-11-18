import { getPlayer, setPlayerAsUnbanned } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Unbans a player.',
    detailedDescription: 'Unbans a player, and/or let\'s a player claim another card again.',
    requiredUserPermissions: 'BAN_MEMBERS',
    usage: '<@user>',
    examples: [
        '@User#1234'
    ]
})
export class Rise extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { guildId } = message;

        const user: User = await args.pick('user').catch(() => message.author);
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await getPlayer(user.id, message.guildId);
        if (!player) return message.reply(`${user} has not rolled any card yet.`);

        if (player.claimsAvailable <= 0) {
            await this.container.prisma.players.update({
                data: {
                    claimsAvailable: 1,
                    rollsAvailable: 3
                },
                where: {
                    userId_guildId: {
                        userId: user.id,
                        guildId: guildId
                    }
                }
            })
        }
        await setPlayerAsUnbanned(user.id, guildId);

        message.reply(`${user} can claim a card again.`);
    }
}