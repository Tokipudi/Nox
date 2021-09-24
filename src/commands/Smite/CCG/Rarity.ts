import { getObtainabilities } from '@lib/database/utils/ObtainabilityUtils';
import { getSkinsByObtainability, getSkins } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Shows all of the different skins rarity.'
})
export class Rarity extends Command {

    public async run(message: Message) {
        const { guildId } = message;

        const msg = await message.reply('Fetching data from Smite\'s servers...');

        const skins = await getSkins();
        const skinsTotal = skins.length;

        const obtainabilities = await getObtainabilities();

        const embed = new MessageEmbed()
            .setTitle('Smite Skins by Rarity')
            .addField('All Skins', `\`\`\`\n${skinsTotal}\n\`\`\``)
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
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

        return msg.edit({ embeds: [embed] });
    }
}