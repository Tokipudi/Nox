import { SmiteMatchesApi } from '@lib/api/hirez/smite/SmiteMatchesApi';
import { getGodById } from '@lib/database/utils/GodsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getFromBetween } from '@lib/utils/Utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import moment from 'moment';

@ApplyOptions<NoxCommandOptions>({
    description: 'Returns the MOTD for the given date (defaults to today).'
})
export class MOTD extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        let date = interaction.options.getString('date');
        if (date == null) {
            date = moment(new Date()).utc().format('MM/DD/YYYY');
        }

        const api = new SmiteMatchesApi();
        const data = await api.getMOTDs();

        for (let motd of data) {
            const startDateTime = moment(new Date(motd.startDateTime));
            if (startDateTime.format('MM/DD/YYYY').startsWith(date)) {
                const embed = new MessageEmbed()
                    .setAuthor({
                        name: this.container.client.user.username,
                        iconURL: this.container.client.user.displayAvatarURL(),
                        url: 'https://github.com/Tokipudi/Nox'
                    })
                    .setColor('DARK_PURPLE')
                    .setTitle(motd.name)
                    .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
                    .setFooter({
                        text: 'Start date'
                    })
                    .setTimestamp(startDateTime.toDate());

                const descriptionLi: any = Object.values(getFromBetween.get(motd.description, '<li>', '</li>'));
                if (descriptionLi.length > 0) {
                    let splitLi = [];
                    const descriptionArray = [];
                    for (let descData of descriptionLi) {
                        splitLi = descData.split('<li>')
                        for (let split of splitLi) {
                            descriptionArray.push(split);
                        }
                    }
                    if (JSON.stringify(descriptionArray) == JSON.stringify(descriptionLi)) {
                        embed.setDescription(`*${motd.description.replace(/\<.*/, '')}*`);
                    } else {
                        embed.setDescription(`*${descriptionArray[0]}*`);
                        descriptionArray.shift();
                    }
                    let other = [];
                    for (let descData of descriptionArray) {
                        descData = descData.split(':');
                        if (descData.length > 1) {
                            if (descData[0] === 'Starting/Maximum Cooldown Reduction') {
                                embed.addField('Cooldown Reduction', `\`\`\`\n${descData[1]}\n\`\`\``, true);
                            } else {
                                embed.addField(descData[0].trim(), `\`\`\`\n${descData[1]}\n\`\`\``, true);
                            }
                        } else {
                            other.push(descData[0]);
                        }
                    }
                    if (other.length > 0) {
                        embed.addField('Other', `\`\`\`\n${other.join(', ').replace('<li>', ',')}\n\`\`\``, true);
                    }
                } else {
                    embed.setDescription(`*${motd.description.replace(/\<.*/, '')}*`);
                }
                if (motd.maxPlayers) {
                    embed.addField('Max players', `\`\`\`\n${motd.maxPlayers.toString()}\n\`\`\``, true);
                }
                if (motd.team1GodsCSV.length > 0 || motd.team2GodsCSV.length > 0) {
                    let availableGods = [];

                    const team1Gods = motd.team1GodsCSV.split(',');
                    for (let j in team1Gods) {
                        const godId = parseInt(team1Gods[j].trim());
                        const god = await getGodById(godId);

                        availableGods.push(god.name);
                    }

                    const team2Gods = motd.team2GodsCSV.split(',');
                    for (let j in team2Gods) {
                        const godId = parseInt(team2Gods[j].trim());
                        const god = await getGodById(godId);

                        availableGods.push(god.name);
                    }

                    if (availableGods.length > 0) {
                        embed.addField('Available Gods', `\`\`\`\n${availableGods.join(', ')}\n\`\`\``);
                    }
                }

                return interaction.reply({ embeds: [embed] });
            }
        }

        return interaction.reply({
            content: 'No MOTD found for the given date `' + date + '`\nMake sure the date is using the following format `MM/DD/YYYY`.',
            ephemeral: true
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'date',
                    description: 'The date you want to get the MOTD of.',
                    required: false,
                    type: 'STRING',
                    autocomplete: true
                }
            ]
        }, {
            guildIds: this.guildIds
        });
    }
}