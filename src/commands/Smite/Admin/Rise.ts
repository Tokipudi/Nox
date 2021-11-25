import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Unbans a player.',
    detailedDescription: 'Unbans a player, and/or let\'s a player claim another card again.',
    requiredUserPermissions: 'BAN_MEMBERS',
    usage: '<@user>',
    examples: [
        '@User#1234'
    ],
    preconditions: ['playerExists']
})
export class Rise extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;

        const user = await args.peek('user').catch(() => author);
        const player = await args.pick('player').catch(async error => {
            if (error.identifier === 'argsMissing') return await getPlayerByUserId(author.id, guildId);
        });
        if (!player) return message.reply('An error occured when trying to load the player.');

        await this.container.prisma.players.update({
            data: {
                claimsAvailable: player.claimsAvailable > 1 ? player.claimsAvailable : 1,
                rollsAvailable: player.rollsAvailable > 3 ? player.rollsAvailable : 3,
                isBanned: false,
                banStartDate: null,
                banEndDate: null
            },
            where: {
                id: player.id
            }
        })

        message.reply(`${user} can claim and roll again.`);
    }
}