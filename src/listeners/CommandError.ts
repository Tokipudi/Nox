import { getCommandEmbed } from '@lib/utils/HelpUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandDeniedPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'commandError'
})
export class CommandError extends Listener<typeof Events.CommandDenied> {

    public async run(error: PreconditionError, payload: CommandDeniedPayload) {
        switch (error.identifier) {
            case 'argsMissing':
                const embed = await getCommandEmbed(payload.message, payload.command.name, payload.context);
                payload.message.reply({
                    content: `There has been an error when trying to process this command.\nPlease make sure you used it properly, as shown below:`, 
                    embeds: [embed]
                });
                break;
            default:
                // Do nothing
                break;
        }
    }
};