import { getPlayerByUserId, setPlayerAsBanned } from '@lib/database/utils/PlayersUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Bans a player.',
    requiredUserPermissions: 'BAN_MEMBERS',
    preconditions: [
        'guildIsActive',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Niflheim extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        let user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        await setPlayerAsBanned(player.id);

        return interaction.reply(`${user} is now banned from the Smite CCG.`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you wish to ban.',
                    required: true,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}