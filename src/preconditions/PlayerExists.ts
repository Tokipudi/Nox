import { createPlayerIfNotExists } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'playerExists'
})
export class PlayerExists extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const authorPlayer = await createPlayerIfNotExists(user.id, guildId);
        if (authorPlayer == null) {
            return this.error({
                message: `An error occured when trying to create the player for ${user}.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        const { member, guildId } = interaction;
        const { user } = member;

        const authorPlayer = await createPlayerIfNotExists(user.id, guildId);
        if (authorPlayer == null) {
            return this.error({
                message: `An error occured when trying to create the player for ${user}.`
            });
        }

        return this.ok();
    }
}