import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'playerIsNotBanned'
})
export class PlayerIsNotBanned extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const authorPlayer = await getPlayerByUserId(user.id, guildId);

        if (authorPlayer.isBanned) {
            return this.error({
                message: `${user} is banned and cannot use this command.`
            });
        }

        return this.ok();
    }
}