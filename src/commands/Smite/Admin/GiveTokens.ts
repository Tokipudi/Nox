import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Gives tokens to a user.',
    requiredUserPermissions: 'ADMINISTRATOR',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class GiveTokens extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        let user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        const tokens = interaction.options.getNumber('tokens', true);

        this.container.prisma.players.update({
            data: {
                tokens: {
                    increment: tokens
                }
            },
            where: {
                id: player.id
            }
        }).then(player => {
            interaction.reply(`\`${tokens}\` tokens have been given to ${user}.`);
        }).catch(e => {
            this.container.logger.error(e);
            interaction.reply({
                content: `An error occured when trying to execute this command.`,
                ephemeral: true
            });
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you wish to give the tokens to.',
                    required: true,
                    type: 'USER'
                },
                {
                    name: 'tokens',
                    description: 'The amount of tokens you wish to give the user.',
                    required: true,
                    type: 'NUMBER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}