import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin, getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Releases either half or all of a player\'s cards.',
    requiredUserPermissions: 'BAN_MEMBERS',
    preconditions: [
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Strife extends NoxCommand {

    private _halfAmountId = 1;
    private _allAmountId = 2;

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        let user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) return interaction.reply('An error occured when trying to load the player.');

        let amount = interaction.options.getNumber('amount', true);

        const skins = await getSkinsByPlayer(player.id);
        if (!skins || !skins.length) return interaction.reply(`${user} does not have any cards!`);

        let skinsToRelease = 0;
        switch (amount) {
            case this._halfAmountId:
                skinsToRelease = Math.round(skins.length / 2);
                break;
            case this._allAmountId:
                skinsToRelease = skins.length;
                break;
        }

        let skinsReleased = [];
        while (skinsToRelease > 0) {
            let randomSkinIndex = Math.floor(Math.random() * skinsToRelease);
            let skin = skins[randomSkinIndex];

            await disconnectSkin(skin.id, player.id);
            this.container.logger.info(`The card ${skin.name}<${skin.id}> was released from player ${user.username}#${user.discriminator}<${user.id}>.`);

            skinsReleased.push(skin.name);
            skins.splice(randomSkinIndex, 1);
            skinsToRelease--;
        }

        let msg = `The following ${skinsReleased.length} cards were release from player ${user}:\n`;
        for (let i in skinsReleased) {
            msg += `- **${skinsReleased[i]}**\n`
        }
        msg += `They have ${skins.length} cards left in their team.`

        interaction.reply(msg);
    }

    public override async autocompleteRun(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        switch (focusedOption.name) {
            case 'amount':
                interaction.respond([
                    {
                        name: 'Half',
                        value: this._halfAmountId
                    },
                    {
                        name: 'All',
                        value: this._allAmountId
                    }
                ]);
                break;
            default:
            // Do Nothing
        }
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
                },
                {
                    name: 'amount',
                    description: 'The amount of cards to randomly remove from a user\'s team.',
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