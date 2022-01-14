import { GodSkinsFullNames } from '@lib/database/interfaces/ViewsInterfaces';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'skinAutocomplete'
})
export class SkinAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'skin') return this.none();

        const query = focusedOption.value.toString();

        const skins: GodSkinsFullNames = await this.container.prisma.$queryRaw`with similarityresults as
        (
            select *, similarity(g."fullName", ${query}) from godskinsfullnames g
            where similarity(g."fullName", ${query}) > 0.66
            order by similarity desc
            limit 25
        )
        select * from similarityresults
        union
        select *, similarity(g."fullName", ${query}) from godskinsfullnames g
        where (select count(*) from similarityresults)=0
        order by similarity desc
        limit 25;`;

        const parsedData = [];
        for (let skin of skins) {
            parsedData.push({
                name: skin.fullName,
                value: skin.skinId
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