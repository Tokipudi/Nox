import { canPlayerClaimRoll, getPlayerById, getTimeLeftBeforeClaim } from '@lib/database/utils/PlayersUtils';
import { connectSkinById } from '@lib/database/utils/SkinsUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'roll',
    description: 'Roll a skin and react with an emoji to claim it.',
    cooldownLimit: 3,
    cooldownDelay: 3600000,
    cooldownScope: 3
})
export class Roll extends Command {

    public async run(message: Message) {
        const msg = await message.reply('Fetching data...');

        const skins = await this.container.prisma.$queryRaw(
            'SELECT Skins.*, Gods.name as godName, SkinsObtainability.name as obtainabilityName ' +
            'FROM Skins, Gods, SkinsObtainability ' +
            'WHERE Skins.godId = Gods.id ' +
            'AND Skins.obtainabilityId = SkinsObtainability.id ' +
            'AND Skins.godSkinUrl != "" ' +
            'AND Skins.playerId IS NULL ' +
            'ORDER BY RANDOM() LIMIT 1;'
        );

        let skin = skins[0];

        let embed = new MessageEmbed()
            .setTitle(skin.name)
            .setAuthor(skin.godName, skin.godIconUrl)
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setImage(skin.godSkinUrl)
            .setFooter(`${skin.obtainabilityName} skin`);

        switch (skin.obtainabilityName) {
            case 'Clan Reward':
            case 'Unlimited':
                embed.setColor('GOLD');
                break;
            case 'Limited':
                embed.setColor('PURPLE');
                break;
            case 'Exclusive':
                embed.setColor('BLUE');
                break;
            case 'Standard':
            default:
                embed.setColor('GREEN');
                break;
        }

        await msg.edit('React with any emoji to claim.');
        await msg.edit({ embeds: [embed] });

        const collector = msg.createReactionCollector({ time: 45000 });

        collector.on('collect', async (reaction, user) => {
            const player = await getPlayerById(user.id);
            const canClaim = await canPlayerClaimRoll(user.id);
            if (player.isBanned) {
                message.channel.send(`${user} You have been banned from playing and cannot claim any card.`);
            } else if (!canClaim) {
                const duration = await getTimeLeftBeforeClaim(user.id);

                message.channel.send(`${user} You have to wait \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\` before claiming a new card again.`);
            } else {
                collector.stop();

                await connectSkinById(skin.id, user.id);

                msg.reply(`${user} has added *${skin.godName}* **${skin.name}** to their collection.`);
                this.container.logger.info(`User ${user.username}#${user.discriminator}<${user.id}> collected ${skin.name}<${skin.id}>.`);
            }
        });

        let wishedPlayers = await this.container.prisma.players.findMany({
            where: {
                wishedSkins: {
                    some: {
                        id: {
                            equals: skin.id
                        }
                    }
                }
            }
        });
        if (wishedPlayers && wishedPlayers.length > 0) {
            for (let k in wishedPlayers) {
                let player = wishedPlayers[k];

                let user = this.container.client.users.cache.get(player.id);
                user.send('A skin in your wishlist is available for grab! ' + msg.url);
            }
        }
    }
}