import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Unbans a player.',
    requiredUserPermissions: 'BAN_MEMBERS',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Rise extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user as User;

        let user = interaction.options.getUser('user', true);
        if (user == null) {
            user = author;
        }

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        await this.container.prisma.players.update({
            data: {
                claimsAvailable: player.claimsAvailable > 1 ? player.claimsAvailable : 1,
                rollsAvailable: player.rollsAvailable > 3 ? player.rollsAvailable : 3,
                isBanned: false,
                banStartDate: null,
                banEndDate: null
            },
            where: {
                id: player.id
            }
        })

        interaction.reply(`${user} can claim and roll again.`);
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
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}