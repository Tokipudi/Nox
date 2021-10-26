import { deleteAllPlayersByGuildId } from '@lib/database/utils/PlayersUtils';
import { resetAllSkinsByGuildId } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Resets the game.',
    detailedDescription: 'Resets every skins and every player in the current guild.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Ragnarock extends NoxCommand {

    public async messageRun(message: Message) {
        const { author } = message;
        const prefix = this.container.client.options.defaultPrefix;
        
        await message.reply(`Are you sure you wish to reset all skins, players and wishlists on this server?\nType \`${prefix}yes\` to agree, or \`${prefix}no\` otherwise.`)

        const filter = (m: Message) => {
            return m.author.id === author.id && (m.content === `${prefix}yes` || m.content === `${prefix}no`);
        };
        const collector = message.channel.createMessageCollector({ filter, time: 120000 /* 2min */ });

        collector.on('collect', async (m: Message) => {
            if (m.content === `${prefix}no`) {
                await message.reply('NoxCommand aborted.');
                collector.stop();
            } else if (m.content === `${prefix}yes`) {
                await resetAllSkinsByGuildId(message.guildId);
                await deleteAllPlayersByGuildId(message.guildId);
                await message.reply('All cards have been reset to their default state and are available for grab again.');
            }
        });
    }
}