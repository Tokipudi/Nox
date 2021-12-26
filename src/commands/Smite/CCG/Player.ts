import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows a player\'s statistics.',
    detailedDescription: 'Shows a player\'s win/loss ratio, joining date and more.\nDefaults to the current user if no user is specified.',
    usage: '<@user>',
    examples: [
        '',
        '@User#1234'
    ],
    preconditions: ['playerExists']
})
export class Player extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;

        const user = await args.peek('user').catch(() => author);
        const player = await args.pick('player').catch(async error => {
            if (error.identifier === 'argsMissing') return await getPlayerByUserId(author.id, guildId);
        });
        if (!player) return message.reply('An error occured when trying to load the player.');

        const skins = await getSkinsByPlayer(player.id);

        let favoriteSkin = null;
        for (const skin of skins) {
            if (skin.playersSkins[0].isFavorite) {
                favoriteSkin = skin;
                break;
            }
        }

        const embed = new MessageEmbed()
            .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL())
            .setDescription(`Tokens: \`${player.tokens}\``)
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp(player.joinDate)
            .setFooter(`#${player.id}`);

        if (favoriteSkin !== null) {
            embed.setImage(favoriteSkin.godSkinUrl);
        }

        embed.addField(
            'Cards',
            `Rolled: \`${player.rolls}\`\n` +
            `Claimed: \`${player.claimedCards}\`\n` +
            `Stolen: \`${player.cardsStolen}\`\n` +
            `Given: \`${player.cardsGiven}\`\n` +
            `Exchanged: \`${player.cardsExchanged}\``,
            true
        );

        let fightDescription =
            `Wins: \`${player.win}\`\n` +
            `Losses: \`${player.loss}\`\n` +
            `Highest Winning Streak: \`${player.highestWinningStreak}\`\n` +
            `Highest Losing Streak: \`${player.highestLosingStreak}\`\n` +
            `All Ins Won: \`${player.allInWins}\`\n` +
            `All Ins Lost: \`${player.allInLoss}\`\n`;

        if (player.win > 0 || player.loss > 0) {
            fightDescription += `Winrate: \`${Math.round(((player.win / (player.win + player.loss)) * 100))}%\`\n`;
        }
        if (player.losingStreak > 0) {
            fightDescription += `Current Losing Streak: \`${player.losingStreak}\`\n`;
        }
        if (player.winningStreak > 0) {
            fightDescription += `Current Winning Streak: \`${player.losingStreak}\`\n`;
        }

        embed.addField('Fights', fightDescription, true);

        return message.reply({ embeds: [embed] });
    }
}