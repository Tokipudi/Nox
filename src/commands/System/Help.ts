/*  
 * Based of the help NoxCommand of the Skyra Project https://github.com/skyra-project/skyra/blob/main/src/commands/General/help.ts
 * Used under Apache License 2.0
 */

import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getCommandEmbed, getCommandsEmbeds } from '@lib/utils/HelpUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandContext } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    aliases: ['commands', 'cmds'],
    description: 'This NoxCommand.',
    detailedDescription: 'Lists all of the commands available for this user.',
    examples: [
        'godskins',
        'roll'
    ]
})
export class Help extends NoxCommand {

    public async messageRun(message: Message, args: Args, context: CommandContext) {
        const commandName: string = await args.rest('string').catch(() => '');

        if (commandName.length > 0) {
            const embed = await getCommandEmbed(message, commandName, context);
            return message.reply({ embeds: [embed] });
        } else {
            const embeds = await getCommandsEmbeds(message, context);
            for (const embed of embeds) {
                try {
                    await message.author.send({ embeds: [embed] });
                } catch (e) {
                    this.container.logger.error(e);
                }
            }
        }
    }
}