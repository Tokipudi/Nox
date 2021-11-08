import { startNewSeason } from '@lib/database/utils/GuildsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Resets the game and start a new season.',
    detailedDescription: 'Resets every skins and every player in the current guild before starting a new season.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class Ragnarock extends NoxCommand {

    public async messageRun(message: Message) {
        const { author, guildId } = message;
        const prefix = this.container.client.options.defaultPrefix;

        await message.reply(`Are you sure you wish to start a new season on this server? This will remove all players acquired skins, wished skins and restart the game.\nType \`${prefix}yes\` to agree, or \`${prefix}no\` otherwise.`)

        const filter = (m: Message) => {
            return m.author.id === author.id && (m.content === `${prefix}yes` || m.content === `${prefix}no`);
        };
        const collector = message.channel.createMessageCollector({ filter, time: 120000 /* 2min */ });

        collector.on('collect', async (m: Message) => {
            if (m.content === `${prefix}no`) {
                await message.reply('NoxCommand aborted.');
                collector.stop();
            } else if (m.content === `${prefix}yes`) {
                const guild = await startNewSeason(guildId);

                await message.reply(`Game has been reset.\nThe current season is now ${guild.season}`);
            }
        });
    }
}