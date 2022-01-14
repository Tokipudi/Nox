import { createPlayerIfNotExists } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows a player\'s statistics.',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Player extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user as User;

        let user = interaction.options.getUser('user');
        if (user == null) {
            user = author;
        }
        if (user.bot) return await interaction.reply('You cannot use this command on a bot.');

        const player = await createPlayerIfNotExists(user.id, guildId);
        if (player == null) return interaction.reply('An error occured when trying to load the player.');

        const skins = await getSkinsByPlayer(player.id);

        let favoriteSkin = null;
        for (const skin of skins) {
            if (skin.playersSkins[0].isFavorite) {
                favoriteSkin = skin;
                break;
            }
        }

        const embed = new MessageEmbed()
            .setAuthor({
                name: `${user.username}#${user.discriminator}`,
                iconURL: user.displayAvatarURL()
            })
            .setDescription(`Tokens: \`${player.tokens}\``)
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp(player.joinDate)
            .setFooter({
                text: `#${player.id}`
            });

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
            fightDescription += `Current Winning Streak: \`${player.winningStreak}\`\n`;
        }

        embed.addField('Fights', fightDescription, true);

        return interaction.reply({ embeds: [embed] });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to check the statistics of. Defaults to the current user if not specified.',
                    required: false,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: [
                '890643277081092117', // Nox Local
                '890917187412439040', // Nox Local 2
                '310422196998897666', // Test Bot
                // '451391692176752650' // The Church
            ]
        });
    }
}