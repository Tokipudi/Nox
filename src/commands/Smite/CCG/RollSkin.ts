import { Command, CommandOptions, PieceContext } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

export class RollSkin extends Command {
    public constructor(context: PieceContext, options: CommandOptions) {
        super(context, {
            ...options,
            name: 'rollskin',
            aliases: ['roll'],
            description: 'Roll skins.'
        });
    }

    public async run(message: Message) {
        const msg = await message.reply('Fetching data...');

        const skins = await this.container.prisma.$queryRaw(
            'SELECT Skins.*, Gods.name as godName, SkinObtainability.name as obtainabilityName ' +
            'FROM Skins, Gods, SkinObtainability ' +
            'WHERE Skins.godId = Gods.id ' +
            'AND Skins.obtainabilityId = SkinObtainability.id ' +
            'AND Skins.godSkinUrl != "" ' +
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

        const collector = msg.createReactionCollector({ max: 1 });

        collector.on('collect', (reaction, user) => {
            this.container.prisma.players.findUnique({
                where: {
                    id: user.id
                }
            }).then(async player => {
                if (!player) {
                    await this.container.prisma.players.create({
                        data: {
                            id: user.id,
                            skins: {
                                connect: {
                                    id: skin.id
                                }
                            }
                        }
                    });
                } else {
                    await this.container.prisma.players.update({
                        data: {
                            skins: {
                                connect: {
                                    id: skin.id
                                }
                            }
                        },
                        where: {
                            id: player.id
                        }
                    });
                }
            }).finally(() => {
                msg.reply(`${user} has added *${skin.godName}* **${skin.name}** to its collection.`);
                this.container.logger.info(`User ${user.username}#${user.discriminator}<${user.id}> collected ${skin.name}<${skin.id}>.`)
            }).catch(err => this.container.logger.error(err));
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