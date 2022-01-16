import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommandErrorPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'chatInputCommandError'
})
export class ChatInputCommandError extends Listener<typeof Events.ChatInputCommandError> {

    public async run(error: PreconditionError, payload: ChatInputCommandErrorPayload) {
        const { interaction } = payload;

        this.container.logger.error(error);

        const errMsg = `An error occurred when trying to run this command.`;
        return interaction.replied
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