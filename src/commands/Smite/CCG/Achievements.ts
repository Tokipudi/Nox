import { getAchievements } from '@lib/achievements/utils/AchievementsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the achievements for the CCG.'
})
export class Cooldown extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { guildId } = message;

        const achievements = await getAchievements();

        const embed = new MessageEmbed()
            .setAuthor(this.container.client.user.username, this.container.client.user.avatarURL())
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp();

        const guild = await this.container.client.guilds.fetch(guildId);
        for (let achievement of achievements) {
            const userIds = await achievement.getCurrentUserIds(guildId);

            let description = `*${achievement.description}*\nReward: \`${achievement.tokens}\` tokens`;

            const users = [];
            for (let userId of userIds) {
                const user = await guild.members.fetch(userId);
                users.push(user);
            }
            
            if (users.length > 0) {
                description += `\nCurrent winner(s): ${users}`;
            }

            embed.addField(achievement.achievementName, description);
        }

        return message.reply({ embeds: [embed] });
    }
}