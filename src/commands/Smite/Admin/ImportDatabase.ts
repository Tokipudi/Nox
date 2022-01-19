import { importFandomMissingData, importGods, importItems, importSkins } from '@lib/database/utils/ImportDatabase';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    name: 'importdatabase',
    description: 'Import data to the database.',
    requiredUserPermissions: 'ADMINISTRATOR',
    preconditions: [
        'guildIsActive'
    ]
})
export class ImportDatabase extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const reply = await interaction.reply({
            content: 'Importing gods from Smite\'s servers...',
            ephemeral: true,
            fetchReply: true
        });

        this.container.logger.info('Importing gods from Smite\'s servers...');
        await importGods();

        interaction.editReply(`${reply.content}\nGods imported. Importing skins...`);
        this.container.logger.info('Gods imported. Importing skins...');
        await importSkins();

        interaction.editReply(`${reply.content}\nSkins imported. Importing missing data from <https://smite.fandom.com/>...`);
        this.container.logger.info('Skins imported. Importing missing data from https://smite.fandom.com/');
        await importFandomMissingData();

        interaction.editReply(`${reply.content}\nFandom data imported. Importing items...`);
        this.container.logger.info('Fandom data imported. Importing items...');
        await importItems();

        this.container.logger.info('Data imported to the database.');
        return interaction.editReply(`${reply.content}\n**Data imported.**`);
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