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

        const items = await this.container.prisma.items.findMany({
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
                ],
                activeFlag: true
            }
        });

        const parsedData = [];
        for (let item of items.slice(0, 25)) {
            parsedData.push({
                name: item.name,
                value: item.id
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