import { NoxCommand } from "@lib/structures/NoxCommand";
import { UserOrMemberMentionRegex } from "@sapphire/discord-utilities";
import { CommandContext, container } from "@sapphire/framework";
import { Collection, Message, MessageEmbed } from "discord.js";

/**
 * Sorts a collection alphabetically as based on the keys, rather than the values.
 * This is used to ensure that subcategories are listed in the pages right after the main category.
 * @param _ The first element for comparison
 * @param __ The second element for comparison
 * @param firstCategory Key of the first element for comparison
 * @param secondCategory Key of the second element for comparison
 */
function sortCommandsAlphabetically(_: NoxCommand[], __: NoxCommand[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
    if (firstCategory > secondCategory) return 1;
    if (secondCategory > firstCategory) return -1;
    return 0;
}

export function getCommandPrefix(context: CommandContext): string {
    return (context.prefix instanceof RegExp && !context.commandPrefix.endsWith(' ')) || UserOrMemberMentionRegex.test(context.commandPrefix)
        ? `${context.commandPrefix} `
        : context.commandPrefix;
}

export async function fetchCommands(message: Message) {
    const commands = container.stores.get('commands');
    const filtered = new Collection<string, NoxCommand[]>();
    await Promise.all(
        commands.map(async (cmd) => {
            const command = cmd as NoxCommand;

            const result = await cmd.preconditions.run(message, command, { command: null! });
            if (!result.success) return;

            const category = filtered.get(command.fullCategory!.join(' → '));
            if (category) category.push(command);
            else filtered.set(command.fullCategory!.join(' → '), [command as NoxCommand]);
        })
    );

    return filtered.sort(sortCommandsAlphabetically);
}

export async function getCommandEmbed(message: Message, commandName: string, context: CommandContext) {
    const commandsByCategories = await fetchCommands(message);

    const prefix = getCommandPrefix(context);

    const embed = new MessageEmbed();

    let commandFound = false;
    commandsByCategories.forEach(async (commands: NoxCommand[], category: string) => {
        for (let command of commands) {
            if (command.name === commandName || (command.aliases != null && command.aliases.length > 0 && command.aliases.includes(commandName))) {
                embed.setAuthor(container.client.user.username, container.client.user.avatarURL())
                    .setTitle(`${prefix}help ${commandName}`)
                    .setColor('DARK_PURPLE')
                    .setTimestamp();

                commandFound = true;

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
                const commandStart = container.client.options.defaultPrefix + command.name + ' ';
                embed.addField(
                    'Usage',
                    command.usage != null && command.usage.length > 0
                        ? `\`\`\`\n${commandStart}${command.usage}\n\`\`\``
                        : `\`\`\`\n${commandStart}\n\`\`\``
                )

                if (command.examples != null && command.examples.length > 0) {
                    embed.addField('Examples', `\`\`\`\n${commandStart}${command.examples.join(`\n${commandStart}`)}\n\`\`\``);
                }

                if (command.aliases != null && command.aliases.length > 0) {
                    embed.addField('Aliases', `\`${command.aliases.join('`, `')}\``)
                }
            }
        }

    });
    return commandFound ? embed : null;
}

export async function getCommandsEmbeds(message: Message, context: CommandContext) {
    const prefix = getCommandPrefix(context);

    const commandsByCategories = await fetchCommands(message);

    const embeds = [];
    commandsByCategories.forEach(async (commands: NoxCommand[], category: string) => {
        const embed = new MessageEmbed()
            .setAuthor(container.client.user.username, container.client.user.avatarURL())
            .setTitle(category)
            .setColor('DARK_PURPLE')
            .setTimestamp();

        for (let command of commands) {
            const commandDescription = command.description
                ? command.description
                : 'No description given.';

            embed.addField(`${prefix}${command.name}`, commandDescription);
        }
        embeds.push(embed);
    });

    return embeds;
}