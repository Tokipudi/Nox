import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommand, ChatInputCommandDeniedPayload, ChatInputCommandRunPayload, Events, Listener, ListenerOptions, PreconditionError } from '@sapphire/framework';
import { CacheType, CommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
    name: 'chatInputCommandRun'
})
export class ChatInputCommandRun extends Listener<typeof Events.ChatInputCommandRun> {

    public async run(interaction: CommandInteraction<CacheType>, command: ChatInputCommand, payload: ChatInputCommandRunPayload) {
        
    }
};