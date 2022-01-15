import { getGodById } from '@lib/database/utils/GodsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton } from '@lib/utils/PaginationUtils';
import { ability1CustomId, ability2CustomId, ability3CustomId, ability4CustomId, ability5CustomId, generateGodAbilityEmbed, generateGodDetailsEmbed, generateGodLoreEmbed, godCustomId, loreCustomId } from '@lib/utils/smite/GodsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageActionRow } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Get more information about a god.'
})
export class God extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member } = interaction;
        const author = member.user;

        const godId = interaction.options.getNumber('god', true);
        const god = await getGodById(godId);
        if (!god) interaction.reply('Unabled to find a god with the name **' + godId + '**');

        const ability1 = JSON.parse(god.ability1);
        const ability2 = JSON.parse(god.ability2);
        const ability3 = JSON.parse(god.ability3);
        const ability4 = JSON.parse(god.ability4);
        const ability5 = JSON.parse(god.ability5);

        const ability1Title = '1st Ability - ' + ability1.Summary;
        const ability2Title = '2nd Ability - ' + ability2.Summary;
        const ability3Title = '3rd Ability - ' + ability3.Summary;
        const ability4Title = '4th Ability - ' + ability4.Summary;
        const ability5Title = 'Passive - ' + ability5.Summary;


        const godButtonBackward = getBackButton('God', godCustomId).setDisabled(false);
        const loreButtonBackward = getBackButton('Lore', loreCustomId).setDisabled(false);
        const loreButtonForward = getForwardButton('Lore', loreCustomId);
        const ability5Backward = getBackButton(ability5Title, ability5CustomId).setDisabled(false);
        const ability5Forward = getForwardButton(ability5Title, ability5CustomId);
        const ability1Backward = getBackButton(ability1Title, ability1CustomId).setDisabled(false);
        const ability1Forward = getForwardButton(ability1Title, ability1CustomId);
        const ability2Backward = getBackButton(ability2Title, ability2CustomId).setDisabled(false);
        const ability2Forward = getForwardButton(ability2Title, ability2CustomId);
        const ability3Backward = getBackButton(ability3Title, ability3CustomId).setDisabled(false);
        const ability3Forward = getForwardButton(ability3Title, ability3CustomId);
        const ability4Forward = getForwardButton(ability4Title, ability4CustomId);

        const reply = await interaction.reply({
            embeds: [generateGodDetailsEmbed(god)],
            components: [
                new MessageActionRow({
                    components: [...([loreButtonForward])]
                })
            ],
            fetchReply: true
        }) as Message;

        const collector = reply.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        collector.on('collect', async interaction => {
            switch (interaction.customId) {
                case loreCustomId:
                    await interaction.update({
                        embeds: [generateGodLoreEmbed(god)],
                        components: [
                            new MessageActionRow({
                                components: [...([godButtonBackward]), ...([ability5Forward])]
                            })
                        ]
                    })
                    break;
                case godCustomId:
                    await interaction.update({
                        embeds: [generateGodDetailsEmbed(god)],
                        components: [
                            new MessageActionRow({
                                components: [...([loreButtonForward])]
                            })
                        ]
                    });
                    break;
                case ability1CustomId:
                    await interaction.update({
                        embeds: [generateGodAbilityEmbed(ability1Title, god, ability1)],
                        components: [
                            new MessageActionRow({
                                components: [...([ability5Backward]), ...([ability2Forward])]
                            })
                        ]
                    });
                    break;
                case ability2CustomId:
                    await interaction.update({
                        embeds: [generateGodAbilityEmbed(ability2Title, god, ability2)],
                        components: [
                            new MessageActionRow({
                                components: [...([ability1Backward]), ...([ability3Forward])]
                            })
                        ]
                    });
                    break;
                case ability3CustomId:
                    await interaction.update({
                        embeds: [generateGodAbilityEmbed(ability3Title, god, ability3)],
                        components: [
                            new MessageActionRow({
                                components: [...([ability2Backward]), ...([ability4Forward])]
                            })
                        ]
                    });
                    break;
                case ability4CustomId:
                    await interaction.update({
                        embeds: [generateGodAbilityEmbed(ability4Title, god, ability4)],
                        components: [
                            new MessageActionRow({
                                components: [...([ability3Backward])]
                            })
                        ]
                    });
                    break;
                case ability5CustomId:
                    await interaction.update({
                        embeds: [generateGodAbilityEmbed(ability5Title, god, ability5)],
                        components: [
                            new MessageActionRow({
                                components: [...([loreButtonBackward]), ...([ability1Forward])]
                            })
                        ]
                    });
                    break;
            }
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'god',
                    description: 'The god you want to check the skins of.',
                    required: true,
                    type: 'NUMBER',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}