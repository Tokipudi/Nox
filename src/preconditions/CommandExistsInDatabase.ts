import { createIfNotExists } from '@lib/database/utils/CommandsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { AsyncPreconditionResult, ChatInputCommand, ContextMenuCommand, Precondition, PreconditionOptions } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
    name: 'commandExistsInDatabase',
    position: 10
})
export class CommandExistsInDatabase extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): AsyncPreconditionResult {
        if (!(await this.commandExistsInDatabase(interaction))) {
            return this.error({
                message: `An error occured when trying to load the command.`
            });
        }

        return this.ok();
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context) {
        if (!(await this.commandExistsInDatabase(interaction))) {
            return this.error({
                message: `An error occured when trying to load the command.`
            });
        }

        return this.ok();
    }

    private async commandExistsInDatabase(interaction: CommandInteraction | ContextMenuInteraction): Promise<boolean> {
        return await createIfNotExists(interaction.command.name, interaction.guildId) != null;
    }
}