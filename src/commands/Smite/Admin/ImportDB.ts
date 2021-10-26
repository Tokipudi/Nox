import { importFandomMissingData, importGods, importSkins } from '@lib/database/utils/ImportDatabase';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';


@ApplyOptions<NoxCommandOptions>({
    name: 'importdb',
    aliases: ['idb'],
    description: 'Import data to the database.',
    detailedDescription: 'Import data to the database. First the gods, then the skins, and finally the fandom data unavailable via the official API.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class ImportDB extends NoxCommand {

    public async messageRun(message: Message) {
        const msg = await message.reply('Importing gods from Smite\'s servers...');

        this.container.logger.info('Importing gods from Smite\'s servers...');
        await importGods();

        msg.edit('Gods imported. Importing skins...');
        this.container.logger.info('Gods imported. Importing skins...');
        await importSkins();

        msg.edit('Skins imported. Importing missing data from <https://smite.fandom.com/>');
        this.container.logger.info('Skins imported. Importing missing data from https://smite.fandom.com/');
        await importFandomMissingData();

        this.container.logger.info('Data imported to the database.');
        return msg.edit('Data imported to the database.');
    }
}