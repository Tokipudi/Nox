import { SmiteServerApi } from '@lib/api/hirez/smite/SmiteServerApi';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    aliases: ['status'],
    description: 'Returns Smite\'s server status.'
})
export class ServerStatus extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const api = new SmiteServerApi();
        const data = await api.getServerStatus();

        // inside a NoxCommand, event listener, etc.
        const embed = new MessageEmbed()
            .setAuthor({
                name: this.container.client.user.username,
                iconURL: this.container.client.user.displayAvatarURL(),
                url: 'https://github.com/Tokipudi/Nox'
            })
            .setTitle('Smite Servers Status')
            .setURL('https://status.hirezstudios.com/')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp();

        let warning = false;
        for (let i = 0; i < data.length; i++) {
            if (i % 2 === 0) {
                embed.addField('\u200B', '\u200B');
            }
            embed.addField(
                data[i].platform.toUpperCase() + ' (' + data[i].environment + ')',
                `\`\`\`\n${data[i].status}\n\`\`\``,
                true
            );
            if (!warning && data[i].status.toLowerCase().trim() !== 'up') {
                warning = true;
            }
        }

        warning
            ? embed.setColor('YELLOW')
            : embed.setColor('GREEN');

        return interaction.reply({ embeds: [embed] });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
        }, {
            guildIds: this.guildIds
        });
    }
}