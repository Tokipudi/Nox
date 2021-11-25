import { createPlayer, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({
    name: 'guildMemberAdd'
})
export class GuildMemberAdd extends Listener<typeof Events.GuildMemberAdd> {

    public async run(member: GuildMember): Promise<void> {
        const { guild, user } = member;

        const player = await getPlayerByUserId(user.id, guild.id);
        if (player === null) {
            createPlayer(user.id, guild.id).then(async (player) => {
                this.container.logger.info(`User ${user} joined the guild ${guild} and had his player <${player.id}> created.`);
            }).catch(e => {
                this.container.logger.error(e);
            });
        }
    }
};