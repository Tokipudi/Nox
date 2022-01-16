import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { matchSorter } from 'match-sorter';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'commandAutocomplete'
})
export class CommandAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'command') return this.none();

        const query = focusedOption.value.toString().trim();

        let commandNames = this.container.stores.get('commands').map((cmd) => cmd.name);
        if (query.length > 0) {
            commandNames = matchSorter(commandNames, query).slice(0, 25)
        }

        const parsedData = [];
        for (let commandName of matchSorter(commandNames, query).slice(0, 25)) {
            parsedData.push({
                name: commandName,
                value: commandName
            });
        }

        return this.some(parsedData);
    }
}