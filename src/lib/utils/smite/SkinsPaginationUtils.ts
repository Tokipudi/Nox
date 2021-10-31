import { MessageEmbed } from "discord.js";

export function generateSkinEmbed(skins, index) {
    const skin = skins[index];

    const embed = new MessageEmbed()
        .setTitle(skin.name)
        .setDescription(`*${skin.obtainability.name}*`)
        .setAuthor(skin.god.name, skin.godIconUrl)
        .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
        .setImage(skin.godSkinUrl)
        .setFooter(`Showing skin ${index + 1} out of ${skins.length}`)
        .setTimestamp(skin.releaseDate);

    switch (skin.obtainability.name) {
        case 'Clan Reward':
        case 'Unlimited':
            embed.setColor('GOLD');
            break;
        case 'Limited':
            embed.setColor('PURPLE');
            break;
        case 'Exclusive':
            embed.setColor('BLUE');
            break;
        case 'Standard':
        default:
            embed.setColor('GREEN');
            break;
    }

    return embed;
}