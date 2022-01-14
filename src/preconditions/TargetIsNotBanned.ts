import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'targetIsNotBanned'
})
export class TargetIsNotBanned extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;

        for (let option of interaction.options.data) {
            if (option.type === 'USER' && !option.user.bot) {
                const player = await getPlayerByUserId(option.user.id, guildId);
                if (player.isBanned) {
                    return this.error({
                        message: `${option.user} is banned and cannot be the target of this command.`
                    });
                }
            }
        }

        return this.ok();
    }
}