import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommandDeniedPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'chatInputCommandDenied'
})
export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {

    public async run(error: PreconditionError, payload: ChatInputCommandDeniedPayload) {
        const { interaction } = payload;

        this.container.logger.error(error);

        const errMsg = `You are missing the required permissions to run this command.`;
        return interaction.replied
            ? interaction.channel.send(errMsg)
            : interaction.reply(errMsg);
    }
};