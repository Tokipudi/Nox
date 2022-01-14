import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Removes tokens from a user.',
    requiredUserPermissions: 'ADMINISTRATOR',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class RemoveTokens extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        let user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) return interaction.reply('An error occured when trying to load the player.');

        let tokens = interaction.options.getNumber('tokens', true);
        if (!tokens) return interaction.reply('You have to specify the amount of tokens you want to give the user.');

        tokens = tokens > player.tokens
            ? player.tokens
            : tokens;

        this.container.prisma.players.update({
            data: {
                tokens: {
                    decrement: tokens
                }
            },
            where: {
                id: player.id
            }
        }).then(player => {
            interaction.reply(`\`${tokens}\` tokens have been removed from ${user}.`);
        }).catch(e => {
            this.container.logger.error(e);
            interaction.reply(`An error occured when trying to execute this command.`);
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you wish to remove the tokens from.',
                    required: true,
                    type: 'USER'
                },
                {
                    name: 'tokens',
                    description: 'The amount of tokens you wish to remove from the user.',
                    required: true,
                    type: 'NUMBER'
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