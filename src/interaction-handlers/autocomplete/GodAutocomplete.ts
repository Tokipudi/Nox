import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { matchSorter } from 'match-sorter';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'godAutocomplete'
})
export class GodAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData: Array<{ name: string, value: string }>) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'god') return this.none();

        const query = focusedOption.value.toString().trim();

        const gods = await this.container.prisma.gods.findMany({
            select: {
                name: true
            }
        });

        const parsedData = [];
        for (let god of matchSorter(gods, query, { keys: ['name'] }).slice(0, 25)) {
            parsedData.push({
                name: god.name,
                value: god.name
            });
        }

        return this.some(parsedData);
    }
}