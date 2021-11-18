import { Reward } from '@lib/rewards/Reward';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getButton, getEndButton, getForwardButton, getStartButton } from '@lib/utils/PaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Snowflake } from 'discord-api-types';
import { Message, MessageActionRow, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the rewards available.',
    preconditions: ['PlayerExists']
})
export class Rewards extends NoxCommand {

    public async messageRun(message: Message) {
        const { author, guildId } = message;

        const rewards = this.fetchRewards();

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const endButton = getEndButton();
        const startButton = getStartButton();

        const selectRewardButtons = [];
        for (let i = 1; i <= rewards.slice(0, 5).length; i++) {
            selectRewardButtons.push(this.getSelectRewardButton(i));
        }

        let index = 0;
        const reply = await message.reply({
            embeds: [await this.generateEmbed(author.id, guildId, rewards, index)],
            components: rewards.length > 5
                ? [
                    new MessageActionRow({
                        components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                    }),
                    new MessageActionRow({
                        components: selectRewardButtons
                    })
                ]
                : [
                    new MessageActionRow({
                        components: selectRewardButtons
                    })
                ]
        });

        const collector = reply.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        });

        collector.on('collect', async interaction => {
            // Increase/decrease index
            if (interaction.customId === startButton.customId) {
                index = 0;
            } else if (interaction.customId === backButton.customId && index >= 5) {
                index -= 5;
            } else if (interaction.customId === forwardButton.customId && index < rewards.length - 6) {
                index += 5;
            } else if (interaction.customId === endButton.customId) {
                index = rewards.length - (rewards.length % 5);
            } else if (interaction.customId.startsWith('reward-')) {
                const i: number = +interaction.customId.replace('reward-', '');
                const selectedRewardKey = index - 1 + i;
                const reward: Reward = rewards[selectedRewardKey];
                
                reward.giveReward(author.id, guildId).then(() => {
                    message.reply(`You successfully claimed the following reward: **${reward.label}**\n`)
                }).catch(e => {
                    message.reply(`An error occured when trying to give you the following reward: **${reward.label}**\nPlease make sure you have enough tokens.`);
                    this.container.logger.error(e);
                });
            }

            selectRewardButtons.length = 0;
            for (let i = 1; i <= rewards.slice(index, index + 5).length; i++) {
                selectRewardButtons.push(this.getSelectRewardButton(i));
            }

            // Disable the buttons if they cannot be used
            forwardButton.disabled = index > rewards.length - 6;
            backButton.disabled = index < 5;
            startButton.disabled = index === 0;
            endButton.disabled = index >= rewards.length - 5;

            // Respond to interaction by updating message with new embed
            await interaction.update({
                embeds: [await this.generateEmbed(author.id, guildId, rewards, index)],
                components: rewards.length > 5
                    ? [
                        new MessageActionRow({
                            components: [...([startButton]), ...([backButton]), ...([forwardButton]), ...([endButton])]
                        }),
                        new MessageActionRow({
                            components: selectRewardButtons
                        })
                    ]
                    : [
                        new MessageActionRow({
                            components: selectRewardButtons
                        })
                    ]
            });
        });
    }

    private getSelectRewardButton(index: number) {
        let emoji = '';
        switch (index) {
            case 1:
                emoji = '1️⃣';
                break;
            case 2:
                emoji = '2️⃣';
                break;
            case 3:
                emoji = '3️⃣';
                break;
            case 4:
                emoji = '4️⃣';
                break;
            case 5:
                emoji = '5️⃣';
                break;
            default:
                throw 'Index needs to be an integer between 1 and 5';
        }
        return getButton(`reward-${index}`, '', 'PRIMARY', emoji);
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

    private async generateEmbed(userId: Snowflake, guildId: Snowflake, rewards: Reward[], index: number) {
        const player = await this.container.prisma.players.findUnique({
            select: {
                tokens: true
            },
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        })
        const embed = new MessageEmbed()
            .setAuthor(this.container.client.user.username, this.container.client.user.avatarURL())
            .setDescription(`*Tokens available: \`${player.tokens}\`*`)
            .setTitle('Rewards')
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setFooter(`Showing rewards ${index + 1}..${index + 5} out of ${rewards.length}`);

        let i = 1;
        for (const reward of rewards.slice(index, index + 5)) {
            let description = `Cost: \`${reward.tokens}\` tokens`;
            embed.addField(`#${i} ${reward.label} | \`${reward.description}\``, description);
            i++;
        }

        return embed;
    }
}