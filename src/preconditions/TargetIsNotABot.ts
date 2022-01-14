import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CacheType, CommandInteraction, CommandInteractionOption } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'targetIsNotABot'
})
export class TargetIsNotABot extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        if (this.optionsContainBot(interaction.options.data)) {
            return this.error({
                message: `You cannot target bots with this command.`
            });
        }

        return this.ok();
    }

    private optionsContainBot(options: readonly CommandInteractionOption<CacheType>[]): boolean {
        for (let option of options) {
            if (option.type === 'USER' && option.user.bot) {
                return true;
            }
        }
        return false;
    }
}