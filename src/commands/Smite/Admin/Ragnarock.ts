import { deleteAllPlayers } from '@lib/database/utils/PlayersUtils';
import { resetAllSkins } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'Resets every skins and every player.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Ragnarock extends Command {

    public async run(message: Message) {
        await resetAllSkins();
        await deleteAllPlayers();

        message.reply('All skins have been reset to their default state and are available for grab again.');
    }
}