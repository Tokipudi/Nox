import { PlayerNotLoadedErrorInterface } from '@lib/structures/errors/interfaces/PlayerNotLoadedErrorInterface';
import { QueryNotFoundErrorInterface } from '@lib/structures/errors/interfaces/QueryNotFoundErrorInterface';
import { NoxError } from '@lib/structures/errors/NoxError';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { QueryNotFoundError } from '@lib/structures/errors/QueryNotFoundError';
import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommandErrorPayload, Events, Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
    name: 'chatInputCommandError'
})
export class ChatInputCommandError extends Listener<typeof Events.ChatInputCommandError> {

    public async run(error: Error, payload: ChatInputCommandErrorPayload) {
        const { interaction } = payload;

        let errMsg = `An error occurred when trying to run this command.`;
        if (error instanceof NoxError && error.identifier != null && error.message != null) {
            switch (error.constructor) {
                case PlayerNotLoadedError: {
                    const context = error.context as PlayerNotLoadedErrorInterface.Context;
                    const user = await this.container.client.users.fetch(context.userId);
                    errMsg = `An error occurred when trying to load the ${user}'s player data.`;
                    break;
                }
                case QueryNotFoundError: {
                    const context = error.context as QueryNotFoundErrorInterface.Context;
                    errMsg = `No result found with the query \`${context.query}\`.`;
                    break;
                }
                default:
                    errMsg = error.message;
            }
        }

        this.container.logger.error(error);

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