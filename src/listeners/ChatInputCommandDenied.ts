import { CommandContextWithCooldown } from '@lib/structures/context/CommandContextWithCooldown';
import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommandDeniedPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'chatInputCommandDenied'
})
export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {

    public async run(error: PreconditionError, payload: ChatInputCommandDeniedPayload) {
        const { interaction } = payload;

        let errMsg = '';
        switch (error.identifier) {
            case 'preconditionCooldown':
                const context = error.context as CommandContextWithCooldown;
                errMsg = `You have to wait \`${this.getTimeLeftBeforeRoll(context.remaining)}\` before rolling again.`;
                break;
            default:
                if (error instanceof PreconditionError) {
                    errMsg = error.message;
                } else {
                    this.container.logger.error(error);
                    errMsg = `You can't do that right now.`;
                }
        }

        if (interaction.replied || interaction.deferred) {
            return interaction.editReply({
                content: errMsg
            });
        }

        return interaction.reply({
            content: errMsg,
            ephemeral: true
        });
    }

    private getTimeLeftBeforeRoll(milliseconds: number) {
        const date = new Date(0);
        date.setMilliseconds(milliseconds);
        const isoString = date.toISOString();
        return `${isoString.substr(17, 2)} seconds`;
    }
};