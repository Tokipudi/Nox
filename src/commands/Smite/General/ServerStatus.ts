import { SmiteServerApi } from '@lib/api/hirez/smite/SmiteServerApi';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'serverstatus',
    aliases: ['status'],
    description: 'Returns Smite\'s server status.'
})
export class ServerStatus extends Command {

    public async run(message: Message) {
        const msg = await message.reply('Fetching data from Smite\'s servers...');

        const api = new SmiteServerApi();
        const data = await api.getServerStatus();

        // inside a command, event listener, etc.
        const embed = new MessageEmbed()
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

        return msg.edit({ embeds: [embed] });
    }
}