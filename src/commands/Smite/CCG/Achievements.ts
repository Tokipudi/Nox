import { Achievement } from '@lib/achievements/Achievement';
import { fetchAchievements } from '@lib/achievements/AchievementUtils';
import { getPlayer } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Guild, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the achievements for the CCG.',
    preconditions: [
        'guildIsActive'
    ]
})
export class Achievements extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        await interaction.deferReply();

        const guild = await this.container.client.guilds.fetch(guildId);

        const achievements = fetchAchievements();

        const embeds = await this.getEmbeds(achievements, guild);

        const paginatedMessage = new PaginatedMessage();
        for (let embed of embeds) {
            paginatedMessage.addPageEmbed(embed);
        }

        return paginatedMessage.run(interaction);
    }

    private async getEmbeds(achievements: Achievement[], guild: Guild): Promise<MessageEmbed[]> {
        const embeds = [];
        let i = 0;
        for (let achievement of achievements) {
            if (i === 0) {
                embeds.push(await this.generateEmbed(achievements, achievements.indexOf(achievement), guild));
                i++;
            } else if (i === 4) {
                i = 0;
            } else {
                i++;
            }
        }

        return embeds;
    }

    private async generateEmbed(achievements: Achievement[], index: number, guild: Guild): Promise<MessageEmbed> {
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
                let user;
                try {
                    user = await guild.members.fetch(player.user.id);
                    users.push(user);
                } catch (e) {
                    this.container.logger.error(e, achievement.name, playerId);
                }
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