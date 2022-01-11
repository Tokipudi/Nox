import { CommandContextWithCooldown } from '@lib/structures/context/CommandContextWithCooldown';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions, MessageCommandDeniedPayload, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'messageCommandDenied'
})
export class CommandDenied extends Listener<typeof Events.MessageCommandDenied> {

    public async run(error: PreconditionError, payload: MessageCommandDeniedPayload) {
        if (payload.command.name === 'roll') {
            switch (error.identifier) {
                case 'preconditionCooldown':
                    const context = error.context as CommandContextWithCooldown;
                    return await payload.message.reply(`You have to wait \`${this.getTimeLeftBeforeRoll(context.remaining)}\` before rolling again.`);
                case 'canPlayerRoll':
                    return payload.message.reply(error.message);
                default:
                // Do nothing
            }
        }
    }

    private getTimeLeftBeforeRoll(milliseconds: number) {
        const date = new Date(0);
        date.setMilliseconds(milliseconds);
        const isoString = date.toISOString();
        return `${isoString.substr(17, 2)} seconds`;
    }
};