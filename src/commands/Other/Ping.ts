import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ContextMenuCommand } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    aliases: ['pong'],
    description: 'Ping? Pong!'
})
export class Ping extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction) {
        await interaction.reply(`Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms.`);
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        });
    }
}