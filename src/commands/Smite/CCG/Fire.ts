import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Fire a card from your collection.',
    preconditions: ['playerExists']
})
export class Fire extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const player = await getPlayerByUserId(author.id, guildId);
        const skinId = interaction.options.getNumber('skin_owned', true);

        const skin = await this.container.prisma.skins.findFirst({
            where: {
                id: skinId,
                playersSkins: {
                    every: {
                        player: {
                            id: player.id
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                god: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!skin) return interaction.reply('The card **' + skin.name + ' ' + skin.god.name + '** does not exist or does not belong to you!');

        await disconnectSkin(skin.id, player.id);

        this.container.logger.info(`The card ${skin.name}<${skin.id}> was removed from the team of ${author.username}#${author.discriminator}<${author.id}>!`)
        return interaction.reply(`The card **${skin.name} ${skin.god.name}** was successfully removed from your team!`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'skin_owned',
                    description: 'The skin you wish to fire from your team.',
                    required: true,
                    type: 'NUMBER',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: [
                '890643277081092117', // Nox Local
                '890917187412439040', // Nox Local 2
                '310422196998897666', // Test Bot
                // '451391692176752650' // The Church
            ]
        });
    }
}