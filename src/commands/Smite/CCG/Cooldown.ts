import { canPlayerClaimRoll, canPlayerRoll, getPlayerByUserId, getTimeLeftBeforeClaim, getTimeLeftBeforeRoll } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    aliases: ['cd'],
    description: 'Shows the remaining cooldown of a given user before being able to claim another card.',
    detailedDescription: 'Shows the remaining cooldown of a given user before being able to claim another card.\nDefaults to the current user if no user is specified.',
    usage: '<@user>',
    examples: [
        '',
        '@User#1234'
    ],
    preconditions: ['PlayerExists']
})
export class Cooldown extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;

        const player = await args.pick('player').catch(async error => {
            if (error.identifier === 'argsMissing') return await getPlayerByUserId(author.id, guildId);
        });
        if (!player) return message.reply('An error occured when trying to load the player.');

        const embed = new MessageEmbed()
            .setAuthor(author.username, author.avatarURL())
            .setTitle('Cooldowns')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setColor('DARK_PURPLE')
            .setTimestamp();

        let cdMsg = '';

        const canRoll = await canPlayerRoll(player.id);
        if (canRoll) {
            cdMsg = `\`${player.rollsAvailable}\` available.`
        } else {
            const duration = await getTimeLeftBeforeRoll(player.id);
            cdMsg = `\`${duration.minutes()}min ${duration.seconds()}s\``;
        }
        embed.addField('Rolls', cdMsg, true);

        const canClaim = await canPlayerClaimRoll(player.id);
        if (canClaim) {
            cdMsg = `\`${player.claimsAvailable}\` available.`;
        } else {
            const duration = await getTimeLeftBeforeClaim(player.id);
            cdMsg = `\`${duration.hours()}h ${duration.minutes()}min ${duration.seconds()}s\``;
        }
        embed.addField('Claims', cdMsg, true);

        return await message.reply({ embeds: [embed] });
    }
}