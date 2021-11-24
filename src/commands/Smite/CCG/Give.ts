import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinsByPlayer, giveSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SkinsPaginationUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageActionRow, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Gives a card you own to a user of your choice.',
    usage: '<@user>',
    examples: [
        '@User#1234'
    ],
    preconditions: ['PlayerExists']
})
export class Give extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const { author, guildId } = message

        const user = await args.peek('user');
        if (!user) return message.reply('The first argument **must** be a user.');
        if (user.id === author.id) return message.reply('You cannot give yourself a card!');
        if (user.bot) return message.reply('You cannot give a card to a bot!');

        const player = await args.pick('player');
        if (!player) return message.reply('An error occured when trying to load the player.');

        const authorPlayer = await getPlayerByUserId(author.id, guildId);

        const backButton = getBackButton();
        const forwardButton = getForwardButton();
        const selectButton = getSelectButton('Give', 'DANGER');

        const skins = await getSkinsByPlayer(authorPlayer.id);
        if (!skins || skins.length === 0) {
            return message.reply('You currently don\'t own any card!');
        }

        let uniqueSkin = skins.length <= 1;
        const embedMessage1 = await message.reply({
            content: 'Select the card you wish to give.',
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
        let godName = '';
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
                godName = interaction.message.embeds[0].author.name;
                collector.stop();
            }
        });

        collector.on('end', async collected => {
            if (skinName === '' || godName === '') {
                message.reply('You did not select a card.');
            } else {
                let skinId = 0;
                for (let i = 0; i < skins.length; i++) {
                    if (skins[i].name === skinName && skins[i].god.name === godName) {
                        skinId = skins[i].id;
                        break;
                    }
                }
                let skin = await giveSkin(player.id, guildId, skinId, false);

                this.container.logger.info(`The card ${skinName}<${skin.id}> was given to ${user.username}#${user.discriminator}<${user.id}> by ${author.username}#${author.discriminator}<${author.id}>!`)
                embedMessage1.edit({
                    content: `The card **${skinName} ${godName}** was successfully given to ${user}!`,
                    embeds: [],
                    components: []
                });
            }
        });

    }
}