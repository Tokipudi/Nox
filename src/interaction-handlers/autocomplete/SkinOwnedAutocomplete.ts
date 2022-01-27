import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { matchSorter } from 'match-sorter';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'skinOwnedAutocomplete'
})
export class SkinOwnedAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData: Array<{ name: string, value: string }>) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'skin_owned') return this.none();

        const query = focusedOption.value.toString().replace('"', '');

        const player = await getPlayerByUserId(interaction.member.user.id, interaction.guildId);

        let skins = [];
        skins = await this.container.prisma.skins.findMany({
            select: {
                name: true,
                id: true,
                god: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                playersSkins: {
                    some: {
                        player: {
                            id: player.id
                        }
                    }
                }
            }
        });

        let parsedData = [];
        for (let skin of skins) {
            const skinFullName = `"${skin.name}" ${skin.god.name}`;
            parsedData.push({
                name: skinFullName,
                value: skinFullName
            });
        }

        parsedData = matchSorter(parsedData, query, { keys: ['name'] }).slice(0, 25);

        return this.some(parsedData);
    }
}