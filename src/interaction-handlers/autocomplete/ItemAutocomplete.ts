import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'itemAutocomplete'
})
export class ItemAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'item') return this.none();

        const query = focusedOption.value.toString().trim();

        const items = await this.container.prisma.items.findMany({
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
                ],
                activeFlag: true
            }
        });

        const parsedData = [];
        for (let item of items.slice(0, 25)) {
            parsedData.push({
                name: item.name,
                value: item.name
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