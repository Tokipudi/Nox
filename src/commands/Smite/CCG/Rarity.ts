import { getObtainabilities } from '@lib/database/utils/ObtainabilityUtils';
import { getSkins, getSkinsByObtainability } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows all of the different skins rarity.',
    preconditions: [
        'guildIsActive'
    ]
})
export class Rarity extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { guildId } = interaction;

        const skins = await getSkins();
        const skinsTotal = skins.length;

        const obtainabilities = await getObtainabilities();

        const embed = new MessageEmbed()
            .setTitle('Smite Skins by Rarity')
            .addField('All Skins', `\`\`\`\n${skinsTotal}\n\`\`\``)
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setColor('DARK_PURPLE')
            .setTimestamp();

        let totalClaimedSkins = 0;
        for (let i = 0; i < obtainabilities.length; i++) {
            const obtainability = obtainabilities[i].name;
            const skinsByObtainability = await getSkinsByObtainability(obtainability, guildId);

            const claimedSkins = [];
            for (let j = 0; j < skinsByObtainability.length; j++) {
                if (skinsByObtainability[j].playersSkins.length > 0) {
                    claimedSkins.push(skinsByObtainability[j].id);
                    totalClaimedSkins++;
                }
            }

            const percentageTotal = ((skinsByObtainability.length / skinsTotal) * 100).toFixed(1);
            embed.addField(
                obtainability,
                `\`\`\`\n${skinsByObtainability.length} (${percentageTotal}%)\n\`\`\``,
                true
            );
        }

        return interaction.reply({ embeds: [embed] });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: this.guildIds
        });
    }
}