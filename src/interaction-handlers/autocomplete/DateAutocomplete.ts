import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { matchSorter } from 'match-sorter';
import moment from 'moment';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'dateAutocomplete'
})
export class DateAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData: Array<{ name: string, value: string }>) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'date') return this.none();

        let query = focusedOption.value.toString();

        let date = moment(new Date()).utc();
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const dateStr = date.format('MM/DD/YYYY').trim();
            dates.push(dateStr)
            date = date.add(1, 'day');
        }

        const parsedData = [];
        for (let date of matchSorter(dates, query).slice(0, 25)) {
            parsedData.push({
                name: date,
                value: date
            });
        }

        return this.some(parsedData);
    }
}