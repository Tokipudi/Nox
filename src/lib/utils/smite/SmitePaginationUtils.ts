import { MessageEmbed } from "discord.js";

export function generateEmbed(skins, index) {
    const skin = skins[index];

    return new MessageEmbed()
        .setTitle(skin.name)
        .setDescription(`${skin.obtainability.name} skin`)
        .setAuthor(skin.god.name, skin.godIconUrl)
        .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
        .setImage(skin.godSkinUrl)
        .setFooter(`Showing skin ${index + 1} out of ${skins.length}`);
}