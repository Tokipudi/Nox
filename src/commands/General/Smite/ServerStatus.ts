import { Command, CommandOptions, PieceContext } from '@sapphire/framework';
import { SmiteServerApi } from '@lib/hirez/smite/SmiteServerApi';
import { Message, MessageEmbed } from 'discord.js';

export class ServerStatus extends Command {
    public constructor(context: PieceContext, options: CommandOptions) {
        super(context, {
            ...options,
            name: 'serverstatus',
            aliases: ['ss'],
            description: 'Returns Smite\'s server status.'
        });
    }

    public async run(message: Message) {
        const msg = await message.reply('Fetching data from Smite\'s servers...');

        const api = new SmiteServerApi();
        const data = await api.getServerStatus();

        // inside a command, event listener, etc.
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Smite Servers Status')
            .setURL('https://status.hirezstudios.com/')
            .setThumbnail('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fexternal-preview.redd.it%2F59ZgrmHWkfJfVE4lsgscbKCuyPUyoH_jk7eSidkM5KQ.png%3Fauto%3Dwebp%26s%3Df1e15e9dc720c3c0ae3d27fbeee31386e12c7e90&f=1&nofb=1')
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