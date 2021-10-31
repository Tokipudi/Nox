import { canPlayerClaimRoll, getPlayer, getTimeLeftBeforeClaim } from '@lib/database/utils/PlayersUtils';
import { connectSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Roll a card and react with an emoji to claim it.',
    cooldownLimit: 3,
    cooldownDelay: 3600000,
    cooldownScope: 3
})
export class Roll extends NoxCommand {

    public async messageRun(message: Message) {
        const { guildId } = message

        const msg = await message.reply('Fetching data...');

        const skins: any = await this.container.prisma.$queryRawUnsafe(
            `select "Skins".*, "Gods"."name" as godname, "SkinsObtainability"."name" as obtainabilityname ` +
            `from "Skins", "Gods", "SkinsObtainability" ` +
            `where "Skins"."godId" = "Gods"."id" ` +
            `and "Skins"."obtainabilityId" = "SkinsObtainability"."id" ` +
            `and "Skins"."id" not in (select "skinId" from "PlayersSkins" where "guildId" = '${guildId}') ` +
            `order by random() limit 1;`
        );

        if (skins.length <= 0) {
            return await msg.edit('No skin found in the database. Please contact an administrator.');
        }
        let skin = skins[0];

        let embed = new MessageEmbed()
            .setTitle(skin.name)
            .setAuthor(skin.godname, skin.godIconUrl)
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setImage(skin.godSkinUrl)
            .setFooter(`${skin.obtainabilityname} card`);

        switch (skin.obtainabilityname) {
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
            const player = await getPlayer(user.id, guildId);
            const canClaim = await canPlayerClaimRoll(user.id, guildId);
            if (player && player.isBanned) {
                message.channel.send(`${user} You have been banned from playing and cannot claim any card.`);
            } else if (!canClaim) {
                const duration = await getTimeLeftBeforeClaim(user.id, guildId);

                message.channel.send(`${user} You have to wait \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\` before claiming a new card again.`);
            } else {
                collector.stop();

                await connectSkin(skin.id, user.id, guildId);

                msg.reply(`${user} has added **${skin.name} ${skin.godname}** to their collection.`);
                this.container.logger.info(`User ${user.username}#${user.discriminator}<${user.id}> collected ${skin.name}<${skin.id}>.`);
            }
        });

        let wishedPlayers = await this.container.prisma.playersWishedSkins.findMany({
            where: {
                skinId: skin.id,
                guildId: guildId
            }
        });
        if (wishedPlayers && wishedPlayers.length > 0) {
            for (let k in wishedPlayers) {
                let player = wishedPlayers[k];

                let user = await this.container.client.users.fetch(player.userId);
                try {
                    await user.send('A card from your wishlist is available for grab! ' + msg.url);
                } catch (e) {
                    this.container.logger.error(e);
                    await message.reply('An error occured when trying to warn you that a skin from your wishlist was available for grab. Make sure you allow direct messages from server members.\nIf the error persists, please contact an administrator.');
                }
            }
        }
    }
}