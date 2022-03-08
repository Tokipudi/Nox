import { addRoll, canPlayerClaimRoll, getMaxSkinsPerTeam, getPlayerByUserId, getTimeLeftBeforeClaim, substractAvailableRolls } from '@lib/database/utils/PlayersUtils';
import { connectSkin } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, ChatInputCommand } from '@sapphire/framework';
import { CommandInteraction, Message, MessageEmbed } from 'discord.js';
import moment from 'moment';

@ApplyOptions<NoxCommandOptions>({
    description: 'Roll a card and react with an emoji to claim it.',
    cooldownLimit: 1,
    cooldownDelay: 5000,
    cooldownScope: 0,
    preconditions: [
        'guildIsActive',
        'playerExists',
        'canPlayerRoll'
    ]
})
export class Roll extends NoxCommand {

    public override async chatInputRun(interaction: CommandInteraction, context: ChatInputCommand.RunContext) {
        const { member, guildId } = interaction;
        const author = member.user;

        const skins: any = await this.container.prisma.$queryRawUnsafe(
            `select "Skins".*, "Gods"."name" as godname, "SkinsObtainability"."name" as obtainabilityname ` +
            `from "Skins", "Gods", "SkinsObtainability" ` +
            `where "Skins"."godId" = "Gods"."id" ` +
            `and "Skins"."obtainabilityId" = "SkinsObtainability"."id" ` +
            `and "Skins"."id" not in ( ` +
            `select "skinId" from "PlayersSkins", "Players", "Guilds" ` +
            `where "PlayersSkins"."playerId" = "Players"."id" ` +
            `and "Players"."guildId" = "Guilds"."id" ` +
            `and "Guilds"."id" = '${guildId}'` +
            `) ` +
            `order by random() limit 1;`
        );

        if (skins.length <= 0) {
            return await interaction.reply({
                content: 'No skin found in the database. Please contact an administrator.\n Your roll was not deducted from your available rolls.',
                ephemeral: true
            });
        }

        const player = await getPlayerByUserId(author.id, guildId);

        await substractAvailableRolls(player.id);

        let skin = skins[0];

        let embed = new MessageEmbed()
            .setTitle(skin.name)
            .setAuthor({
                name: skin.godname,
                iconURL: skin.godIconUrl
            })
            .setThumbnail('https://static.wikia.nocookie.net/smite_gamepedia/images/5/5c/SmiteLogo.png/revision/latest/scale-to-width-down/150?cb=20180503190011')
            .setImage(skin.godSkinUrl)
            .setFooter({
                text: `${skin.obtainabilityname} card`
            });

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

        await addRoll(player.id);
        const reply = await interaction.reply({
            content: 'React with any emoji to claim.',
            embeds: [embed],
            fetchReply: true
        }) as Message;

        const collector = reply.createReactionCollector({ time: 45000 });

        collector.on('collect', async (reaction, user) => {
            const player = await getPlayerByUserId(user.id, guildId);
            const canClaim = await canPlayerClaimRoll(player.id);
            if (player && player.isBanned) {
                interaction.followUp({
                    content: `${user} You have been banned from playing and cannot claim any card.`
                });
            } else if (!canClaim) {
                const duration = await getTimeLeftBeforeClaim(player.id);
                interaction.followUp({
                    content: `${user} You have to wait \`${duration.hours()} hour(s), ${duration.minutes()} minutes and ${duration.seconds()} seconds\` before claiming a new card again.`
                });
            } else if (player.playersSkins.length >= getMaxSkinsPerTeam()) {
                await interaction.followUp(`${user} You already have a full team and cannot claim any more skins right now.`);
            } else {
                collector.stop();

                await connectSkin(skin.id, player.id);
                await this.container.prisma.players.update({
                    data: {
                        claimsAvailable: {
                            decrement: 1
                        },
                        lastClaimChangeDate: moment.utc().toDate()
                    },
                    where: {
                        id: player.id
                    }
                });
                if (user.id !== author.id) {
                    await this.container.prisma.players.update({
                        data: {
                            cardsStolen: {
                                increment: 1
                            },
                            claimedCards: {
                                increment: 1
                            }
                        },
                        where: {
                            id: player.id
                        }
                    });
                } else {
                    await this.container.prisma.players.update({
                        data: {
                            claimedCards: {
                                increment: 1
                            }
                        },
                        where: {
                            id: player.id
                        }
                    });
                }

                interaction.followUp(`${user} has added **${skin.name} ${skin.godname}** to their collection.`);
                this.container.logger.info(`Player ${player.id} collected ${skin.name} ${skin.godname}<${skin.id}>.`);
            }
        });

        let wishedPlayers = await this.container.prisma.playersWishedSkins.findMany({
            where: {
                skinId: skin.id,
                player: {
                    guild: {
                        id: guildId
                    }
                }
            },
            include: {
                player: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (wishedPlayers && wishedPlayers.length > 0) {
            for (let wishedPlayer of wishedPlayers) {
                let user = await this.container.client.users.fetch(wishedPlayer.player.user.id);
                try {
                    await user.send('A card from your wishlist is available for grab! ' + reply.url);
                } catch (e) {
                    this.container.logger.error(e);
                }
            }
        }
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: this.guildIds
        });
    }
}