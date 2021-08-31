import { Command, CommandOptions, PieceContext } from '@sapphire/framework';
import { SmiteServerApi } from '@lib/hirez/smite/SmiteServerApi';
import { Message, MessageEmbed } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

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
            .setColor('#0099ff')
            .setTitle('Smite Servers Status')
            .setURL('https://status.hirezstudios.com/')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setTimestamp();

        for (let i = 0; i < data.length; i++) {
            if (i % 2 === 0) {
                embed.addField('\u200B', '\u200B');
            }
            embed.addField(
                data[i].platform.toUpperCase() + ' (' + data[i].environment + ')',
                data[i].status,
                true
            );
        }

        return msg.edit({ embeds: [embed] });
    }
}