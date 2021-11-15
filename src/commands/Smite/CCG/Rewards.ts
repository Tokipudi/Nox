import { Reward } from '@lib/rewards/Reward';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getEndButton, getForwardButton, getStartButton } from '@lib/utils/PaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Guild, Message, MessageActionRow, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the rewards available.'
})
export class Rewards extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message;
        const guild = await this.container.client.guilds.fetch(guildId);

        const rewards = this.fetchRewards();

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const endButton = getEndButton();
        const startButton = getStartButton();

        let index = 0;
        const embed = await message.reply({
            embeds: [await this.generateEmbed(rewards, index, guild)],
            components: rewards.length > 5
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
                    if (index < rewards.length - 6) {
                        index += 5;
                    }
                    break;
                case endButton.customId:
                    index = rewards.length - (rewards.length % 5);
                    break;
            }

            // Disable the buttons if they cannot be used
            forwardButton.disabled = index > rewards.length - 6;
            backButton.disabled = index < 5;
            startButton.disabled = index === 0;
            endButton.disabled = index >= rewards.length - 5;

            // Respond to interaction by updating message with new embed
            await interaction.update({
                embeds: [await this.generateEmbed(rewards, index, guild)],
                components: rewards.length > 5
                    ? [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        })
                    ]
                    : []
            });
        });
    }

    private fetchRewards() {
        const rewards = [];
        this.container.stores.get('rewards').sort((a, b) => {
            return a.name.localeCompare(b.name);
        }).forEach((reward: Reward) => {
            rewards.push(reward);
        });

        return rewards;
    }

    private async generateEmbed(rewards: Reward[], index: number, guild: Guild) {
        const embed = new MessageEmbed()
            .setAuthor(this.container.client.user.username, this.container.client.user.avatarURL())
            .setTitle('Rewards')
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setFooter(`Showing rewards ${index + 1}..${index + 5} out of ${rewards.length}`);

        for (const reward of rewards.slice(index, index + 5)) {
            let description = `Cost: \`${reward.tokens}\` tokens`;
            embed.addField(reward.label + ` | \`${reward.description}\``, description);
        }

        return embed;
    }
}