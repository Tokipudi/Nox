import { ApplyOptions } from '@sapphire/decorators';
import { ContextMenuCommandDeniedPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'contextMenuCommandDenied'
})
export class ChatInputCommandDenied extends Listener<typeof Events.ContextMenuCommandDenied> {

    public async run(error: PreconditionError, payload: ContextMenuCommandDeniedPayload) {
        const { interaction } = payload;

        this.container.logger.error(error);

        const errMsg = `You are missing the required permissions to run this command.`;
        return interaction.replied
            ? interaction.channel.send(errMsg)
            : interaction.reply(errMsg);
    }
};