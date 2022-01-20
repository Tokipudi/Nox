import { canPlayerClaimRoll, canPlayerRoll, createPlayerIfNotExists, getTimeLeftBeforeClaim, getTimeLeftBeforeRoll } from '@lib/database/utils/PlayersUtils';
import { PlayerNotLoadedError } from '@lib/structures/errors/PlayerNotLoadedError';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Shows the remaining cooldown of a given user before being able to claim another card.',
    preconditions: [
        'guildIsActive',
        'targetIsNotABot',
        'playerExists',
        'targetPlayerExists',
        'targetIsNotBanned'
    ]
})
export class Cooldown extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user as User;

        let user = interaction.options.getUser('user');
        if (user == null) {
            user = author;
        }

        const player = await createPlayerIfNotExists(user.id, guildId);
        if (player == null) throw new PlayerNotLoadedError({
            userId: user.id,
            guildId: guildId
        });

        const embed = new MessageEmbed()
            .setAuthor({
                name: `${user.username}#${user.discriminator}`,
                iconURL: user.displayAvatarURL()
            })
            .setTitle('Cooldowns')
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setColor('DARK_PURPLE')
            .setTimestamp();

        let cdMsg = '';

        const canRoll = await canPlayerRoll(player.id);
        if (canRoll) {
            cdMsg = `\`${player.rollsAvailable}\` available.`
        } else {
            const duration = await getTimeLeftBeforeRoll(player.id);
            cdMsg = `\`${duration.minutes()}min ${duration.seconds()}s\``;
        }
        embed.addField('Rolls', cdMsg, true);

        const canClaim = await canPlayerClaimRoll(player.id);
        if (canClaim) {
            cdMsg = `\`${player.claimsAvailable}\` available.`;
        } else {
            const duration = await getTimeLeftBeforeClaim(player.id);
            cdMsg = `\`${duration.hours()}h ${duration.minutes()}min ${duration.seconds()}s\``;
        }
        embed.addField('Claims', cdMsg, true);

        return await interaction.reply({ embeds: [embed] });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to check the cooldown of.',
                    required: false,
                    type: 'USER'
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}