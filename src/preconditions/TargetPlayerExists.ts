import { createPlayerIfNotExists } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'targetPlayerExists'
})
export class TargetPlayerExists extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;

        for (let option of interaction.options.data) {
            if (option.type === 'USER' && !option.user.bot) {
                const player = await createPlayerIfNotExists(option.user.id, guildId);
                if (player == null) {
                    return this.error({
                        message: `An error occured when trying to create the player for ${option.user}.`
                    });
                }
            }
        }

        return this.ok();
    }
}