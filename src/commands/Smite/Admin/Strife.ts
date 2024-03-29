import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin, getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Releases either half or all of a player\'s cards.',
    requiredUserPermissions: 'BAN_MEMBERS',
    preconditions: [
        'guildIsActive',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists'
    ]
})
export class Strife extends NoxCommand {

    private _halfAmountId = 'half';
    private _allAmountId = 'all';

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        let user = interaction.options.getUser('user', true);

        const player = await getPlayerByUserId(user.id, guildId);
        if (!player) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        let amount = interaction.options.getString('amount', true);

        const skins = await getSkinsByPlayer(player.id);
        if (!skins || !skins.length) return interaction.reply({
            content: `${user} does not have any cards!`,
            ephemeral: true
        });

        let skinsToRelease = 0;
        switch (amount) {
            case this._halfAmountId:
                skinsToRelease = Math.round(skins.length / 2);
                break;
            case this._allAmountId:
                skinsToRelease = skins.length;
                break;
            default:
            // Do nothing
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
                    type: 'STRING',
                    choices: [
                        {
                            name: toTitleCase(this._halfAmountId),
                            value: this._halfAmountId
                        },
                        {
                            name: toTitleCase(this._allAmountId),
                            value: this._allAmountId
                        }
                    ]

                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}