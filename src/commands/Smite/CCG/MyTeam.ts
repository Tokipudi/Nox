import { disconnectSkinByName, getSkinsByUserId } from '@lib/database/utils/SkinsUtils';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageActionRow } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'myteam',
    description: 'List the skins you currently own.'
})
export class MyTeam extends Command {

    public async run(message: Message) {
        const { author } = message
        
        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Fire', 'DANGER');

        const skins = await getSkinsByUserId(author.id);
        if (!skins || skins.length === 0) {
            return message.reply('You currently don\'t own any skin!');
        }

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Here is your team.',
            embeds: [generateSkinEmbed(skins, 0)],
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
                    embeds: [generateSkinEmbed(skins, currentIndex)],
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
            let skin = await disconnectSkinByName(skinName);

            this.container.logger.info(`The skin ${skinName}<${skin.id}> was fired from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
            embedMessage1.edit({
                content: `The skin **${skinName}** was successfully fired from your team!`,
                embeds: [],
                components: []
            });
        });
    }
}