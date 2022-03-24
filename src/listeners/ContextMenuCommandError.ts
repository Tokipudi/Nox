import { PlayerNotLoadedErrorInterface } from '@lib/structures/errors/interfaces/PlayerNotLoadedErrorInterface';
import { NoxError } from '@lib/structures/errors/NoxError';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { ApplyOptions } from '@sapphire/decorators';
import { ContextMenuCommandErrorPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'contextMenuCommandError'
})
export class ContextMenuCommandError extends Listener<typeof Events.ContextMenuCommandError> {

    public async run(error: PreconditionError, payload: ContextMenuCommandErrorPayload) {
        const { interaction } = payload;

        let errMsg = `An error occurred when trying to run this command.`;
        if (error instanceof NoxError && error.identifier != null && error.message != null) {
            switch (error.constructor) {
                case PlayerNotLoadedError:
                    const context = error.context as PlayerNotLoadedErrorInterface.Context;
                    const user = await this.container.client.users.fetch(context.userId);
                    errMsg = `An error occurred when trying to load the ${user}'s player data.`;
                    break;
                default:
                    errMsg = error.message;
            }
        }

        this.container.logger.error(error, payload);

        return interaction.replied || interaction.deferred
            ? interaction.followUp({
                content: errMsg,
                ephemeral: true
            })
            : interaction.reply({
                content: errMsg,
                ephemeral: true
            });
    }
};