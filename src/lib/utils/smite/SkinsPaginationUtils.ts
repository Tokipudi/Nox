import { NoxPaginatedMessage } from "@lib/structures/NoxPaginatedMessage";
import { MessageEmbed } from "discord.js";

export function generateSkinEmbed(skins, index) {
    const skin = skins[index];

    const embed = new MessageEmbed()
        .setTitle(skin.name)
        .setAuthor({
            name: skin.god.name,
            iconURL: skin.godIconUrl
        })
        .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
        .setImage(skin.godSkinUrl)
        .setFooter({
            text: skin.obtainability.name
        })
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

export function getSkinsPaginatedMessage(skins): NoxPaginatedMessage {
    const paginatedMessage = new NoxPaginatedMessage();

    for (let skin of skins) {
        const embed = new MessageEmbed()
            .setTitle(skin.name)
            .setAuthor({
                name: skin.god.name,
                iconURL: skin.godIconUrl
            })
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setImage(skin.godSkinUrl)
            .setFooter({
                text: skin.obtainability.name
            })
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

        paginatedMessage.addPageEmbed(embed);
    }

    return paginatedMessage;
}
