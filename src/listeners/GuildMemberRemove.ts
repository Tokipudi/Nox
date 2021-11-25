import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({
    name: 'guildMemberRemove'
})
export class GuildMemberRemove extends Listener<typeof Events.GuildMemberRemove> {

    public async run(member: GuildMember): Promise<void> {
        const { guild, user } = member;

        const player = await getPlayerByUserId(user.id, guild.id);
        if (player != null) {
            this.container.prisma.players.update({
                data: {
                    playersSkins: {
                        deleteMany: {}
                    },
                    wishedSkins: {
                        deleteMany: {}
                    }
                },
                where: {
                    id: player.id
                }
            }).then(async (player) => {
                this.container.logger.info(`Player ${player.id} left the guild. Their owned skins and wished skins have been reset.`);
            }).catch(e => {
                this.container.logger.error(e);
            });
        }
    }
};