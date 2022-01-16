import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'godAutocomplete'
})
export class GodAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'god') return this.none();

        const query = focusedOption.value.toString().trim();

        const gods = await this.container.prisma.gods.findMany({
            select: {
                name: true,
                id: true
            },
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        name: {
                            search: query.replace(/\s+/g, ' | '),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        });

        const parsedData = [];
        for (let god of gods.slice(0, 25)) {
            parsedData.push({
                name: god.name,
                value: god.name
            });
        }

        parsedData.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        return this.some(parsedData);
    }
}