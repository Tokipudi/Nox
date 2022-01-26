import { Achievement } from '@lib/achievements/Achievement';
import { fetchAchievements } from '@lib/achievements/AchievementUtils';
import { getPlayer } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getEndButton, getForwardButton, getStartButton } from '@lib/utils/PaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Guild, Message, MessageActionRow, MessageComponentInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the achievements for the CCG.',
    preconditions: [
        'guildIsActive'
    ]
})
export class Achievements extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const reply = await interaction.deferReply({
            fetchReply: true
        }) as Message;

        const guild = await this.container.client.guilds.fetch(guildId);

        const achievements = fetchAchievements();

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const endButton = getEndButton();
        const startButton = getStartButton();

        let index = 0;
        await interaction.editReply({
            embeds: [await this.generateEmbed(achievements, index, guild)],
            components: achievements.length > 5
                ? [
                    new MessageActionRow({
                        components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                    })
                ]
                : []
        }) as Message;

        const filter = async (i: MessageComponentInteraction) => {
            await i.deferUpdate();
            return i.user.id === author.id
        }
        const collector = reply.createMessageComponentCollector({
            filter: filter
        });

        collector.on('collect', async i => {
            // Increase/decrease index
            switch (i.customId) {
                case startButton.customId:
                    index = 0;
                    break;
                case backButton.customId:
                    if (index >= 5) {
                        index -= 5;
                    }
                    break;
                case forwardButton.customId:
                    if (index < achievements.length - 5) {
                        index += 5;
                    }
                    break;
                case endButton.customId:
                    index = achievements.length - (achievements.length % 5);
                    break;
            }

            // Disable the buttons if they cannot be used
            forwardButton.disabled = index > achievements.length - 5;
            backButton.disabled = index < 5;
            startButton.disabled = index === 0;
            endButton.disabled = index >= achievements.length - 5;

            // Respond to interaction by updating message with new embed
            await interaction.editReply({
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

    private async generateEmbed(achievements: Achievement[], index: number, guild: Guild) {
        const embed = new MessageEmbed()
            .setAuthor({
                name: this.container.client.user.username,
                iconURL: this.container.client.user.displayAvatarURL(),
                url: 'https://github.com/Tokipudi/Nox'
            })
            .setTitle('Achievements')
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011');

        const maxIndex = index + 5 >= achievements.length
            ? achievements.length
            : index + 5;
        const achievementPaginatedStr = index + 1 === achievements.length
            ? achievements.length
            : `${index + 1}..${maxIndex}`;

        embed.setFooter({
            text: `Showing achievements ${achievementPaginatedStr} out of ${achievements.length}`
        });

        for (const achievement of achievements.slice(index, index + 5)) {
            const playerIds = await achievement.getCurrentPlayerIds(guild.id);

            let description = `Reward: \`${achievement.tokens}\` tokens`;

            const users = [];
            for (let playerId of playerIds) {
                const player = await getPlayer(playerId);
                const user = await guild.members.fetch(player.user.id);
                users.push(user);
            }

            if (users.length > 0) {
                description += `\nCurrent winner(s): ${users}`;
            }

            embed.addField(achievement.label + ` | \`${achievement.description}\``, description);
        }

        return embed;
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: this.guildIds
        });
    }
}