import { canPlayerClaimRoll, getTimeLeftBeforeClaim } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    aliases: ['cd'],
    description: 'Shows the remaining cooldown of a given user before being able to claim another card.',
    detailedDescription: 'Shows the remaining cooldown of a given user before being able to claim another card.\nDefaults to the current user if no user is specified.',
    usage: '<@user>',
    examples: [
        '',
        '@User#1234'
    ]
})
export class Cooldown extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;
        const user: User = await args.pick('user').catch(() => author);

        const canClaim = await canPlayerClaimRoll(user.id, guildId);
        if (canClaim) {
            return await message.reply(`${user} can claim a roll!`);
        }

        const duration = await getTimeLeftBeforeClaim(user.id, guildId);

        return await message.reply(`${user} has to wait \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\` before claiming a new card again.`);
    }
}