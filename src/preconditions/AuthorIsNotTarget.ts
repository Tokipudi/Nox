import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'authorIsNotTarget'
})
export class AuthorIsNotTarget extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        if (this.authorIsTarget(interaction)) {
            return this.error({
                message: `You cannot target yourself with this command.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        if (this.authorIsTarget(interaction)) {
            return this.error({
                message: `You cannot target yourself with this command.`
            });
        }

        return this.ok();
    }

    private authorIsTarget(interaction: CommandInteraction | ContextMenuInteraction): boolean {
        for (let option of interaction.options.data) {
            if (option.type === 'USER' && option.user.id === interaction.user.id) {
                return true;
            }
        }
        return false;
    }
}