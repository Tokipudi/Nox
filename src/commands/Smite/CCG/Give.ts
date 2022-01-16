import { createPlayerIfNotExists, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { getSkinOwner, giveSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getSkinIdFromStringParameter } from '@lib/utils/interaction-handlers/AutocompleteUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Gives a card you own to a user of your choice.',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists',
        'targetIsNotBanned'
    ]
})
export class Give extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const user = interaction.options.getUser('user', true);
        if (user.bot) return await interaction.reply('You cannot use this command on a bot.');

        const player = await createPlayerIfNotExists(user.id, guildId);
        if (player == null) return interaction.reply('An error occured when trying to load the player.');

        const skinFullName = interaction.options.getString('skin_owned', true);
        const skinId = await getSkinIdFromStringParameter(skinFullName);
        if (!skinId) return await interaction.reply(`No skin found with the name \`${skinFullName}\`.`);

        const authorPlayer = await getPlayerByUserId(author.id, guildId);

        const skinOwner = await getSkinOwner(skinId);
        if (skinOwner.playerId != authorPlayer.id) {
            return await interaction.reply('The chosen skin does not belong to you.')
        }

        const skin = await giveSkin(player.id, guildId, skinId, false);

        return await interaction.reply(`The card **${skin.name} ${skin.god.name}** was successfully given to ${user}!`)
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The you wish to give the skin to.',
                    required: true,
                    type: 'USER'
                },
                {
                    name: 'skin_owned',
                    description: 'The skin you wish to give.',
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