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

        const gods = await this.container.prisma.gods.findMany({
            select: {
                name: true,
                id: true
            },
            where: {
                OR: [
                    {
                        name: {
                            contains: focusedOption.value.toString(),
                            mode: 'insensitive'
                        }
                    },
                    {
                        name: {
                            search: focusedOption.value.toString().trim().replace(/\s+/g, ' | ')
                        }
                    }
                ]
            }
        });

        const parsedData = [];
        for (let god of gods.slice(0, 25)) {
            parsedData.push({
                name: god.name,
                value: god.id
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