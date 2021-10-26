import { SmiteMatchesApi } from '@lib/api/hirez/smite/SmiteMatchesApi';
import { getGodById } from '@lib/database/utils/GodsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { getFromBetween } from '@lib/utils/Utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import moment from 'moment';

@ApplyOptions<NoxCommandOptions>({
    description: 'Returns the MOTD for the given date (default today).',
    usage: '[MM/DD/YYYY]',
    examples: [
        '',
        moment().format('MM/DD/YYYY')
    ]
})
export class MOTD extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const date: string = await args.rest('string').catch(() => moment(new Date()).utc().format('MM/DD/YYYY'));

        const msg = await message.reply('Fetching data from Smite\'s servers...');

        const api = new SmiteMatchesApi();
        const data = await api.getMOTDs();

        for (let i in data) {
            const motd = data[i];

            const startDateTime = moment(new Date(motd.startDateTime));
            if (startDateTime.format('MM/DD/YYYY').startsWith(date)) {
                const embed = new MessageEmbed()
                    .setAuthor('Match of the Day')
                    .setTitle(motd.name)
                    .setDescription(motd.description.replace(/\<.*/, ''))
                    .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
                    .setFooter('Start date')
                    .setTimestamp(startDateTime.toDate());

                const descriptionLi = getFromBetween.get(motd.description, '<li>', '</li>');
                if (descriptionLi.length > 0) {
                    let other = [];
                    for (let j in descriptionLi) {
                        const descData = descriptionLi[j].split(':');
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

                return msg.edit({ embeds: [embed] });
            }
        }

        return msg.edit('No MOTD found for the given date `' + date + '`\nMake sure the date is using the following format `MM/DD/YYYY`.');
    }
}