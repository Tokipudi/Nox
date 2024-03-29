import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin } from '@lib/database/utils/SkinsUtils';
import { QueryNotFoundError } from '@lib/structures/errors/QueryNotFoundError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getSkinIdFromStringParameter } from '@lib/utils/interaction-handlers/AutocompleteUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Fire a card from your collection.',
    preconditions: [
        'guildIsActive',
        'playerExists'
    ]
})
export class Fire extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const player = await getPlayerByUserId(author.id, guildId);

        const skinFullName = interaction.options.getString('skin_owned', true);
        const skinId = await getSkinIdFromStringParameter(skinFullName);
        if (!skinId) throw new QueryNotFoundError({
            query: skinFullName
        });

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
        if (!skin) return interaction.reply({
            content: 'The card **' + skin.name + ' ' + skin.god.name + '** does not exist or does not belong to you!',
            ephemeral: true
        });

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
                    type: 'STRING',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}