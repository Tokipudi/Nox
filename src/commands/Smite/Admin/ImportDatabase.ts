import { importFandomMissingData, importGods, importSkins } from '@lib/database/utils/ImportDatabase';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    name: 'importdatabase',
    description: 'Import data to the database.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class ImportDatabase extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        await interaction.reply('Importing gods from Smite\'s servers...');

        this.container.logger.info('Importing gods from Smite\'s servers...');
        await importGods();

        interaction.editReply('Gods imported. Importing skins...');
        this.container.logger.info('Gods imported. Importing skins...');
        await importSkins();

        interaction.editReply('Skins imported. Importing missing data from <https://smite.fandom.com/>');
        this.container.logger.info('Skins imported. Importing missing data from https://smite.fandom.com/');
        await importFandomMissingData();

        this.container.logger.info('Data imported to the database.');
        return interaction.editReply('Data imported to the database.');
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