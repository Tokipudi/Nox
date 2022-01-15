import { Players } from '.prisma/client';
import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { Reward } from '@lib/rewards/Reward';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getButton, getEndButton, getForwardButton, getStartButton } from '@lib/utils/PaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the rewards available.',
    preconditions: ['playerExists']
})
export class Rewards extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const rewards = this.fetchRewards();

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const endButton = getEndButton();
        const startButton = getStartButton();

        const selectRewardButtons = [];
        for (let i = 1; i <= rewards.slice(0, 5).length; i++) {
            selectRewardButtons.push(this.getSelectRewardButton(i));
        }

        const player = await getPlayerByUserId(author.id, guildId);

        let index = 0;
        const reply = await interaction.reply({
            embeds: [await this.generateEmbed(player, rewards, index)],
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
                ],
            fetchReply: true
        }) as Message;

        const collector = reply.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        });

        collector.on('collect', async messageInteraction => {
            // Increase/decrease index
            if (messageInteraction.customId === startButton.customId) {
                index = 0;
            } else if (messageInteraction.customId === backButton.customId && index >= 5) {
                index -= 5;
            } else if (messageInteraction.customId === forwardButton.customId && index < rewards.length - 6) {
                index += 5;
            } else if (messageInteraction.customId === endButton.customId) {
                index = rewards.length - (rewards.length % 5);
            } else if (messageInteraction.customId.startsWith('reward-')) {
                const i: number = +messageInteraction.customId.replace('reward-', '');
                const selectedRewardKey = index - 1 + i;
                const reward: Reward = rewards[selectedRewardKey];

                reward.giveReward(player.id).then(() => {
                    interaction.editReply({
                        content: `You successfully claimed the following reward: **${reward.label}**\n`,
                        components: [],
                        embeds: []
                    })
                }).catch(e => {
                    interaction.editReply({
                        content: `An error occured when trying to give you the following reward: **${reward.label}**\nPlease make sure you have enough tokens.`,
                        components: [],
                        embeds: []
                    });
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
            await messageInteraction.update({
                embeds: [await this.generateEmbed(player, rewards, index)],
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

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: this.guildIds
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

    private async generateEmbed(player: Players, rewards: Reward[], index: number) {
        const embed = new MessageEmbed()
            .setAuthor({
                name: this.container.client.user.username,
                iconURL: this.container.client.user.displayAvatarURL(),
                url: 'https://github.com/Tokipudi/Nox'
            })
            .setDescription(`*Tokens available: \`${player.tokens}\`*`)
            .setTitle('Rewards')
            .setColor('DARK_PURPLE')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setFooter({
                text: `Showing rewards ${index + 1}..${index + 5} out of ${rewards.length}`
            });

        let i = 1;
        for (const reward of rewards.slice(index, index + 5)) {
            let description = `Cost: \`${reward.tokens}\` tokens`;
            embed.addField(`#${i} ${reward.label} | \`${reward.description}\``, description);
            i++;
        }

        return embed;
    }
}