import { getGodByName } from '@lib/database/utils/GodsUtils';
import { getBackButton, getForwardButton } from '@lib/utils/PaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageActionRow } from 'discord.js';
import { generateGodDetailsEmbed, generateGodLoreEmbed, generateGodAbilityEmbed, godCustomId, loreCustomId, ability1CustomId, ability2CustomId, ability3CustomId, ability4CustomId, ability5CustomId } from '@lib/utils/smite/GodsPaginationUtils';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { NoxCommand } from '@lib/structures/NoxCommand';

@ApplyOptions<NoxCommandOptions>({
    description: 'Get more information about a god.',
    usage: '<god name>',
    examples: [
        'Ymir',
        'Nu Wa'
    ]
})
export class God extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author } = message

        let godName: string = await args.rest('string');
        godName = toTitleCase(godName);

        let god = await getGodByName(godName);
        if (!god) message.reply('Unabled to find a god with the name **' + godName + '**');

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

        const reply = await message.reply({
            embeds: [generateGodDetailsEmbed(god)],
            components: [
                new MessageActionRow({
                    components: [...([loreButtonForward])]
                })
            ]
        });

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
}