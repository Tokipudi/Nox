import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    requiredUserPermissions: 'ADMINISTRATOR',
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