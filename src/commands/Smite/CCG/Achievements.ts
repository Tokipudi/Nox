import { Achievement } from '@lib/achievements/Achievement';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getEndButton, getForwardButton, getStartButton } from '@lib/utils/PaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Guild, Message, MessageActionRow, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the achievements for the CCG.'
})
export class Achievements extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;
        const guild = await this.container.client.guilds.fetch(guildId);

        const achievements = this.fetchAchievements();

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const endButton = getEndButton();
        const startButton = getStartButton();

        let index = 0;
        const embed = await message.reply({
            embeds: [await this.generateEmbed(achievements, index, guild)],
            components: achievements.length > 5
                ? [
                    new MessageActionRow({
                        components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                    })
                ]
                : []
        });

        const collector = embed.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        });

        collector.on('collect', async interaction => {
            // Increase/decrease index
            switch (interaction.customId) {
                case startButton.customId:
                    index = 0;
                    break;
                case backButton.customId:
                    if (index >= 5) {
                        index -= 5;
                    }
                    break;
                case forwardButton.customId:
                    if (index < achievements.length - 6) {
                        index += 5;
                    }
                    break;
                case endButton.customId:
                    index = achievements.length - (achievements.length % 5);
                    break;
            }

            // Disable the buttons if they cannot be used
            forwardButton.disabled = index > achievements.length - 6;
            backButton.disabled = index < 5;
            startButton.disabled = index === 0;
            endButton.disabled = index >= achievements.length - 5;

            // Respond to interaction by updating message with new embed
            await interaction.update({
                embeds: [await this.generateEmbed(achievements, index, guild)],
                components: achievements.length > 5
                    ? [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        })
                    ]
                    : []
            });
        });
    }

    private fetchAchievements() {
        const achievements = [];
        this.container.stores.get('achievements').sort((a, b) => {
            return a.name.localeCompare(b.name);
        }).forEach((achievement: Achievement) => {
            achievements.push(achievement);
        });

        return achievements;
    }

    private async generateEmbed(achievements: Achievement[], index: number, guild: Guild) {
        const embed = new MessageEmbed()
            .setAuthor(this.container.client.user.username, this.container.client.user.avatarURL())
            .setTitle('Achievements')
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setFooter(`Showing achievements ${index + 1}..${index + 5} out of ${achievements.length}`);

        for (const achievement of achievements.slice(index, index + 5)) {
            const userIds = await achievement.getCurrentUserIds(guild.id);

            let description = `Reward: \`${achievement.tokens}\` tokens`;

            const users = [];
            for (let userId of userIds) {
                const user = await guild.members.fetch(userId);
                users.push(user);
            }

            if (users.length > 0) {
                description += `\nCurrent winner(s): ${users}`;
            }

            embed.addField(achievement.label + ` | \`${achievement.description}\``, description);
        }

        return embed;
    }
}