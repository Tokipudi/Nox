import { ApplyOptions } from '@sapphire/decorators';
import { ContextMenuCommandErrorPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'contextMenuCommandError'
})
export class ContextMenuCommandError extends Listener<typeof Events.ContextMenuCommandError> {

    public async run(error: PreconditionError, payload: ContextMenuCommandErrorPayload) {
        const { interaction } = payload;

        this.container.logger.error(error);

        const errMsg = `An error occurred when trying to run this command.`;
        return interaction.replied
            ? interaction.channel.send(errMsg)
            : interaction.reply(errMsg);
    }
};