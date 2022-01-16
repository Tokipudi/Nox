import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandlerOptions>({
    interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    name: 'skinOwnedAutocomplete'
})
export class SkinOwnedAutocomplete extends InteractionHandler {

    public async run(interaction: AutocompleteInteraction, parsedData) {
        await interaction.respond(parsedData);
    }

    public async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== 'skin_owned') return this.none();

        const query = focusedOption.value.toString().replace('"', '');
        const words = query.split(' ');
        const searchQueryArray = [];
        for (let word of words) {
            word = word.trim();
            if (word != null) {
                searchQueryArray.push(word.trim());
            }
        }
        let searchQuery = searchQueryArray.join(' | ');

        const player = await getPlayerByUserId(interaction.member.user.id, interaction.guildId);

        let skins = [];
        skins = await this.container.prisma.skins.findMany({
            select: {
                name: true,
                id: true,
                god: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                OR: [
                    {
                        name: {
                            search: searchQuery,
                            mode: 'insensitive'
                        },
                    },
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        god: {
                            name: {
                                search: searchQuery,
                                mode: 'insensitive'
                            }
                        },
                    },
                    {
                        god: {
                            name: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        },
                    }
                ],
                playersSkins: {
                    some: {
                        player: {
                            id: player.id
                        }
                    }
                }
            },
            take: 25
        });

        const parsedData = [];
        for (let skin of skins) {
            const skinFullName = `"${skin.name}" ${skin.god.name}`;
            parsedData.push({
                name: skinFullName,
                value: skinFullName
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