import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    aliases: ['pong'],
    requiredUserPermissions: 'BAN_MEMBERS',
    description: 'Ping? Pong!'
})
export class Ping extends NoxCommand {

    public override async messageRun(message: Message) {
        const msg = await message.channel.send('Ping?');

        return msg.edit(
            `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`
        );
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        await interaction.reply(`Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms.`);
    }

    public override async contextMenuRun(interaction: CommandInteraction) {
        await interaction.reply(`Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms.`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        });

        registry.registerContextMenuCommand({
            name: this.name,
            description: this.description
        });
    }
}