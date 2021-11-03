import { disconnectSkin, getSkinsByUser, getTimeLeftBeforeExhaustEnd } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageActionRow } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'List the cards you currently own.'
})
export class MyTeam extends NoxCommand {

    public async messageRun(message: Message) {
        const { author, guildId } = message

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Fire', 'DANGER');

        const skins = await getSkinsByUser(author.id, guildId);
        if (!skins || skins.length === 0) {
            return message.reply('You currently don\'t own any card!');
        }

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Here is your team.',
            embeds: [await this.generateEmbed(skins, 0, guildId)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin ? [...([selectButton])] : [...([backButton]), ...([selectButton]), ...([forwardButton])]
                })
            ]
        })

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        })

        let skinName = '';
        let currentIndex = 0
        collector.on('collect', async interaction => {
            if (interaction.customId === backButton.customId || interaction.customId === forwardButton.customId) {
                // Increase/decrease index
                switch (interaction.customId) {
                    case backButton.customId:
                        if (currentIndex > 0) {
                            currentIndex -= 1;
                        }
                        break;
                    case forwardButton.customId:
                        if (currentIndex < skins.length - 1) {
                            currentIndex += 1;
                        }
                        break;
                }

                // Disable the buttons if they cannot be used
                forwardButton.disabled = currentIndex === skins.length - 1;
                backButton.disabled = currentIndex === 0;

                // Respond to interaction by updating message with new embed
                await interaction.update({
                    embeds: [await this.generateEmbed(skins, currentIndex, message.guildId)],
                    components: [
                        new MessageActionRow({
                            components: [...([backButton]), ...([selectButton]), ...([forwardButton])]
                        })
                    ]
                })
            } else if (interaction.customId === selectButton.customId) {
                skinName = interaction.message.embeds[0].title;
                collector.stop();
            }
        });

        collector.on('end', async collected => {
            if (skinName) {
                let skinId = 0;
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === skinName) {
                        skinId = skins[i].id;
                        break;
                    }
                }
                let skin = await disconnectSkin(skinId, guildId);

                this.container.logger.info(`The card ${skinName}<${skin.id}> was fired from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
                embedMessage1.edit({
                    content: `The card **${skinName}** was successfully fired from your team!`,
                    embeds: [],
                    components: []
                });
            }
        });
    }

    protected async generateEmbed(skins, index, guildId) {
        const embed = generateSkinEmbed(skins, index);

        const skin = skins[index];

        if (skin.playersSkins[0].win || skin.playersSkins[0].loss) {
            const win = skin.playersSkins[0].win;
            const loss = skin.playersSkins[0].loss;
            const ratio = (win / (win + loss)) * 100;
            
            embed.addField('Wins', `\`${win}\``, true);
            embed.addField('Loss', `\`${loss}\``, true);
            embed.addField('Success rate', `\`${ratio}%\``, true);
        }

        if (skin.playersSkins[0].isExhausted) {
            const duration = await getTimeLeftBeforeExhaustEnd(skin.id, guildId);
            embed.addField('Exhausted', `Available in \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\`.`);
        }

        return embed;
    }
}