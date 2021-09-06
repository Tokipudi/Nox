import { getSkinsByUserId, giveSkinByUserId } from '@lib/database/utils/SkinsUtils';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageActionRow, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'give',
    description: 'Gives a skin you own to a user of your choice.'
})
export class Give extends Command {

    public async run(message: Message, args: Args) {
        const { author } = message
        const user: User = await args.pick('user');

        if (!user) return message.reply('The first argument **must** be a user.');
        if (user.id === author.id) return message.reply('You cannot give yourself a skin!');
        if (user.bot) return message.reply('You cannot give a skin to a bot!');

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Give', 'DANGER');

        const skins = await getSkinsByUserId(author.id);
        if (!skins || skins.length === 0) {
            return message.reply('You currently don\'t own any skin!');
        }

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Select the skin you wish to give.',
            embeds: [generateSkinEmbed(skins, 0)],
            components: [
                new MessageActionRow({
                    components: uniqueSkin ? [...([selectButton])] : [...([backButton]), ...([selectButton]), ...([forwardButton])]
                })
            ]
        })

        const collector = embedMessage1.createMessageComponentCollector({
            filter: ({ user }) => user.id === author.id
        });

        let skinName = '';
        let currentIndex = 0;
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
            if (skinName === '') {
                message.reply('You did not select a skin.');
            } else {
                let skinId = 0;
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === skinName) {
                        skinId = skins[i].id;
                        break;
                    }
                }
                let skin = await giveSkinByUserId(user.id, skinId);

                this.container.logger.info(`The skin ${skinName}<${skin.id}> was given to ${user.username}#${user.discriminator}<${user.id}> by ${author.username}#${author.discriminator}<${author.id}>!`)
                embedMessage1.edit({
                    content: `The skin **${skinName}** was successfully given to ${user}!`,
                    embeds: [],
                    components: []
                });
            }
        });

    }
}