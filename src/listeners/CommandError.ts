import { CommandContextWithCooldown } from '@lib/structures/context/CommandContextWithCooldown';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandDeniedPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'commandDenied'
})
export class CommandError extends Listener<typeof Events.CommandDenied> {

    public async run(error: PreconditionError, payload: CommandDeniedPayload) {
        if (payload.command.name === 'roll') {
            switch (error.identifier) {
                case 'preconditionCooldown':
                    const context = error.context as CommandContextWithCooldown;
                    await payload.message.reply(`You have to wait \`${this.getTimeLeftBeforeRoll(context.remaining)}\` before rolling again.`)
                    break;
                default:
                // Do nothing
            }
        }
    }

    private getTimeLeftBeforeRoll(milliseconds: number) {
        const date = new Date(0);
        date.setMilliseconds(milliseconds);
        const isoString = date.toISOString();
        return `${isoString.substr(14, 2)} minutes and ${isoString.substr(17, 2)} seconds`;
    }
};