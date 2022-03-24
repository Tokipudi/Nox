import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Gives rolls to a player.',
    requiredUserPermissions: 'BAN_MEMBERS',
    preconditions: [
        'guildIsActive',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class GiveRolls extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        const user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        const rollsToAdd = interaction.options.getInteger('rolls', true);

        await this.container.prisma.players.update({
            data: {
                rollsAvailable: {
                    increment: rollsToAdd
                }
            },
            where: {
                id: player.id
            }
        })

        interaction.reply(`${user} has been given \`${rollsToAdd}\` more rolls.`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you wish to unban.',
                    required: true,
                    type: 'USER'
                },
                {
                    name: 'rolls',
                    description: 'The amount of rolls to give to the player.',
                    required: true,
                    type: 'INTEGER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}