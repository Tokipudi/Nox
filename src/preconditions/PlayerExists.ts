import { createPlayer, createPlayerIfNotExists, getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, Command, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message, Snowflake } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'playerExists'
})
export class playerExists extends Precondition {

    public async messageRun(message: Message, command: Command): AsyncPreconditionResult {
        const { author, guildId } = message;

        const player = await createPlayerIfNotExists(author.id, guildId);

        if (player == null) {
            return this.error({
                message: `An error occured when trying to create the player.`
            });
        }

        return this.ok();
    }

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const player = await createPlayerIfNotExists(user.id, guildId);

        if (player == null) {
            return this.error({
                message: `An error occured when trying to create the player.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context): AsyncPreconditionResult {
        const { member, guildId } = interaction;
        const { user } = member;

        const player = await createPlayerIfNotExists(user.id, guildId);

        if (player == null) {
            return this.error({
                message: `An error occured when trying to create the player.`
            });
        }

        return this.ok();
    }
}