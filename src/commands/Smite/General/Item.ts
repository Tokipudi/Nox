import { isItemDescription } from '@lib/database/utils/ItemsUtils';
import { getItemByName } from '@lib/database/utils/ItemUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Get an item\'s information.'
})
export class Item extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const itemName = interaction.options.getString('item', true);
        const item = await getItemByName(itemName);
        if (item == null) return interaction.reply(`No item found with the name \`${itemName}\`.`);

        const embed = new MessageEmbed()
            .setAuthor({
                name: this.container.client.user.username,
                iconURL: this.container.client.user.displayAvatarURL(),
                url: 'https://github.com/Tokipudi/Nox'
            })
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setImage(item.itemIconUrl)
            .setColor('DARK_PURPLE');

        let title = item.name;
        if (item.startingItem) {
            title += ` *(Starter)*`
        } else if (item.type.toLowerCase() != 'item') {
            title += ` *(${toTitleCase(item.type)})*`
        }
        embed.setTitle(title);

        let desc = `*"${item.shortDescription}"*`;
        if (isItemDescription(item.itemDescription)) {
            if (item.itemDescription.SecondaryDescription != null) {
                desc += `\n\n${item.itemDescription.SecondaryDescription}`;
            }

            for (let menuItem of item.itemDescription.Menuitems) {
                embed.addField(menuItem.Description, `\`\`\`css\n${menuItem.Value}\`\`\``, true)
            }
        }
        embed.setDescription(desc);

        embed.addField('Price', `\`\`\`fix\n${item.price}\`\`\``);

        return interaction.reply({
            embeds: [embed]
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'item',
                    description: 'The item you wish to get the information of.',
                    required: true,
                    type: 'STRING',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}