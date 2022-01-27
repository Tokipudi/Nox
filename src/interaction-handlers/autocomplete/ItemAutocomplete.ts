import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { matchSorter } from 'match-sorter';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'itemAutocomplete'
})
export class ItemAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData: Array<{ name: string, value: string }>) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'item') return this.none();

        const query = focusedOption.value.toString().trim();

        const items = await this.container.prisma.items.findMany({
            select: {
                name: true
            },
            where: {
                activeFlag: true
            }
        });

        const parsedData = [];
        for (let item of matchSorter(items, query, { keys: ['name'] }).slice(0, 25)) {
            parsedData.push({
                name: item.name,
                value: item.name
            });
        }

        return this.some(parsedData);
    }
}