import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import moment from 'moment';

@ApplyOptions<CommandOptions>({
    name: 'rollskin',
    aliases: ['roll'],
    description: 'Roll skins.',
    cooldownLimit: 10,
    cooldownDelay: 3600000,
    cooldownScope: 3
})
export class RollSkin extends Command {

    public async run(message: Message) {
        const msg = await message.reply('Fetching data...');

        const skins = await this.container.prisma.$queryRaw(
            'SELECT Skins.*, Gods.name as godName, SkinObtainability.name as obtainabilityName ' +
            'FROM Skins, Gods, SkinObtainability ' +
            'WHERE Skins.godId = Gods.id ' +
            'AND Skins.obtainabilityId = SkinObtainability.id ' +
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

        await msg.edit('React with any emoji to claim.');
        await msg.edit({ embeds: [embed] });

        const filter = async (reaction, user) => {
            let player = await this.container.prisma.players.findUnique({
                where: {
                    id: user.id
                }
            });
            if (!player) {
                player = await this.container.prisma.players.create({
                    data: {
                        id: user.id
                    }
                });
            }
            return player.isNew || moment.utc().isSameOrAfter(moment(player.lastSkinDate).add(3, 'hour'));
        };
        const collector = msg.createReactionCollector({ filter });

        collector.on('collect', async (reaction, user) => {
            await this.container.prisma.players.update({
                data: {
                    isNew: false,
                    lastSkinDate: moment.utc().toDate(),
                    skins: {
                        connect: {
                            id: skin.id
                        }
                    }
                },
                where: {
                    id: user.id
                }
            });
            msg.reply(`${user} has added *${skin.godName}* **${skin.name}** to its collection.`);
            this.container.logger.info(`User ${user.username}#${user.discriminator}<${user.id}> collected ${skin.name}<${skin.id}>.`);
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