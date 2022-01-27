import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';
import { matchSorter } from 'match-sorter';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'seasonAutocomplete'
})
export class SeasonAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData: Array<{ name: string, value: string }>) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'season') return this.none();

        const query = focusedOption.value.toString();

        const guild = await this.container.prisma.guilds.findUnique({
            where: {
                id: interaction.guildId
            }
        });

        const parsedData = [];
        const seasons = [];
        for (let i = guild.season; i >= 1; i--) {
            seasons.push(i);
        }

        for (let season of matchSorter(seasons, query,).slice(0, 25)) {
            parsedData.push({
                name: season,
                value: season
            });
        }

        return this.some(parsedData);
    }
}