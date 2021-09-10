/*  
 * Based of the help command of the Skyra Project https://github.com/skyra-project/skyra/blob/main/src/commands/General/help.ts
 * Used under Apache License 2.0
 */

import { ApplyOptions } from '@sapphire/decorators';
import { UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { Args, Command, CommandContext, CommandOptions } from '@sapphire/framework';
import { Collection, Message, MessageEmbed } from 'discord.js';

/**
 * Sorts a collection alphabetically as based on the keys, rather than the values.
 * This is used to ensure that subcategories are listed in the pages right after the main category.
 * @param _ The first element for comparison
 * @param __ The second element for comparison
 * @param firstCategory Key of the first element for comparison
 * @param secondCategory Key of the second element for comparison
 */
function sortCommandsAlphabetically(_: Command[], __: Command[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
    if (firstCategory > secondCategory) return 1;
    if (secondCategory > firstCategory) return -1;
    return 0;
}

@ApplyOptions<CommandOptions>({
    aliases: ['commands', 'cmds'],
    description: 'This command.',
    detailedDescription: 'Lists all of the commands available for this user.'
})
export class Help extends Command {

    public async run(message: Message, args: Args, context: CommandContext) {
        const commandName: string = await args.rest('string').catch(() => '');

        const commandsByCategories = await this.fetchCommands(message);

        const prefix = this.getCommandPrefix(context);

        if (commandName.length > 0) {
            commandsByCategories.forEach(async (commands: Command[], category: string) => {
                const embed = new MessageEmbed()
                    .setAuthor(this.container.client.user.username, this.container.client.user.avatarURL())
                    .setTitle(prefix + commandName)
                    .setColor('PURPLE')
                    .setTimestamp();

                for (let i in commands) {
                    const command = commands[i];

                    if (command.name === commandName) {
                        const commandDescription = command.description
                            ? command.description
                            : 'No description given.';

                        embed.setDescription(`**${category}**`);
                        embed.addField(
                            'Description',
                            command.detailedDescription
                                ? command.detailedDescription
                                : commandDescription
                        )

                        if (command.aliases.length > 0) {
                            embed.addField('Aliases', `\`${command.aliases.join('`, `')}\``)
                        }

                        return message.author.send({ embeds: [embed] });
                    }
                }

            })
        } else {
            commandsByCategories.forEach(async (commands: Command[], category: string) => {
                const embed = new MessageEmbed()
                    .setAuthor(this.container.client.user.username, this.container.client.user.avatarURL())
                    .setTitle(category)
                    .setColor('PURPLE')
                    .setTimestamp();

                for (let i in commands) {
                    const command = commands[i];

                    const commandDescription = command.description
                        ? command.description
                        : 'No description given.';

                    embed.addField(`${prefix}${command.name}`, commandDescription);
                }
                message.author.send({ embeds: [embed] });
            })
        }
    }

    private async fetchCommands(message: Message) {
        const commands = this.container.stores.get('commands');
        const filtered = new Collection<string, Command[]>();
        await Promise.all(
            commands.map(async (cmd) => {
                const command = cmd as Command;

                const result = await cmd.preconditions.run(message, command, { command: null! });
                if (!result.success) return;

                const category = filtered.get(command.fullCategory!.join(' → '));
                if (category) category.push(command);
                else filtered.set(command.fullCategory!.join(' → '), [command as Command]);
            })
        );

        return filtered.sort(sortCommandsAlphabetically);
    }

    private getCommandPrefix(context: CommandContext): string {
        return (context.prefix instanceof RegExp && !context.commandPrefix.endsWith(' ')) || UserOrMemberMentionRegex.test(context.commandPrefix)
            ? `${context.commandPrefix} `
            : context.commandPrefix;
    }
}