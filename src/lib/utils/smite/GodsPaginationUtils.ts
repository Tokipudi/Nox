import { Gods } from ".prisma/client";
import { MessageEmbed } from "discord.js";

export const godCustomId = 'godCustomId';
export const loreCustomId = 'loreCustomId';
export const ability1CustomId = 'ability1CustomId';
export const ability2CustomId = 'ability2CustomId';
export const ability3CustomId = 'ability3CustomId';
export const ability4CustomId = 'ability4CustomId';
export const ability5CustomId = 'ability5CustomId';

export function generateGodDetailsEmbed(god: Gods | any) {
    let embed = new MessageEmbed()
        .setAuthor(god.name, god.godIconUrl)
        .setColor('BLUE')
        .addField('Class', god.roles, true)
        .addField('Type', god.type, true)
        .addField('Pros', god.pros, false)
        .addField('Health', `\`\`\`css\n${god.health} (+${god.healthPerLevel})\n\`\`\``, true)
        .addField('Mana', `\`\`\`cs\n${god.mana} (+${god.manaPerLevel})\n\`\`\``, true)
        .addField('Speed', `\`\`\`fix\n${god.speed}\n\`\`\``, true)
        .addField('Physical protection', `\`\`\`cs\n${god.physicalProtection} (+${god.physicalProtectionPerLevel})\n\`\`\``, true)
        .addField('Magical protection', `\`\`\`cs\n${god.magicProtection} (+${god.magicProtectionPerLevel})\n\`\`\``, true)
        .setImage(god.skins[0].godSkinUrl)
        .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
        .setFooter(`${god.pantheon.name} - ${god.roles}`);

    let description = '';
    if (god.latestGod) description += 'Latest god\n';
    if (god.onFreeRotation) description += 'On free rotation\n';
    if (description !== '') embed.setDescription(description);

    return embed;
}

export function generateGodLoreEmbed(god: Gods | any) {
    return new MessageEmbed()
        .setAuthor(god.name, god.godIconUrl)
        .setColor('BLUE')
        .setTitle(god.title)
        .setDescription(god.lore.replaceAll('\\n', '\n'))
        .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
        .setFooter(`${god.pantheon.name} - ${god.roles}`);
}

export function generateGodAbilityEmbed(title, god: Gods | any, ability) {
    const embed = new MessageEmbed()
        .setAuthor(god.name, god.godIconUrl)
        .setColor('BLUE')
        .setTitle(title)
        .setDescription(ability.Description.itemDescription.description.replaceAll('\\n', '\n'))
        .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
        .setImage(ability.URL)
        .setFooter(`${god.pantheon.name} - ${god.roles}`);

    for (let i = 0; i < ability.Description.itemDescription.rankitems.length; i++) {
        let rankItem = ability.Description.itemDescription.rankitems[i];
        embed.addField(rankItem.description, rankItem.value, true);
    }

    return embed;
}