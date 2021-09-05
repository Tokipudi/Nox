import { SmiteGodsApi } from '@lib/api/hirez/smite/SmiteGodsApi';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
    name: 'importdb',
    aliases: ['idb'],
    description: 'Import data to the database.',
    requiredUserPermissions: 'ADMINISTRATOR'
})
export class ImportDB extends Command {

    public async run(message: Message) {
        const msg = await message.reply('Importing gods from Smite\'s servers...');
        this.container.logger.info('Importing gods from Smite\'s servers...');

        await this.importGods();
        msg.edit('Gods imported. Importing skins...');
        this.container.logger.info('Gods imported. Importing skins...');
        await this.importSkins();

        this.container.logger.info('Data imported to the database.');
        return msg.edit('Data imported to the database.');
    }

    private async importGods() {
        const api = new SmiteGodsApi();
        const data = await api.getGods();

        for (let i in data) {
            let god = data[i];

            let godFromDb = await this.container.prisma.gods.findUnique({
                where: {
                    id: god.id
                }
            });
            if (!godFromDb) {
                await this.container.prisma.gods.create({
                    data: {
                        id: god.id,
                        name: god.Name,
                        ability1: JSON.stringify(god.Ability_1),
                        ability2: JSON.stringify(god.Ability_2),
                        ability3: JSON.stringify(god.Ability_3),
                        ability4: JSON.stringify(god.Ability_4),
                        ability5: JSON.stringify(god.Ability_5),
                        cons: god.Cons,
                        pros: god.Pros,
                        godCardUrl: god.godCard_URL,
                        godIconUrl: god.godIcon_URL,
                        lore: god.Lore,
                        roles: god.Roles,
                        title: god.Title,
                        type: god.Type,
                        AttackSpeedPerLevel: god.AttackSpeedPerLevel,
                        attackSpeed: god.AttackSpeed,
                        autoBanned: god.AutoBanned !== 'n',
                        health: god.Health,
                        healthPerLevel: god.HealthPerLevel,
                        hp5PerLevel: god.HP5PerLevel,
                        latestGod: god.latestGod !== 'n',
                        magicProtection: god.MagicProtection,
                        magicProtectionPerLevel: god.MagicProtectionPerLevel,
                        magicalPower: god.MagicalPower,
                        magicalPowerPerLevel: god.MagicalPowerPerLevel,
                        mana: god.Mana,
                        manaPerFive: god.ManaPerFive,
                        manaPerLevel: god.ManaPerLevel,
                        mp5PerLevel: god.MP5PerLevel,
                        onFreeRotation: god.OnFreeRotation !== '',
                        physicalPower: god.PhysicalPower,
                        physicalPowerPerLevel: god.PhysicalPowerPerLevel,
                        physicalProtection: god.PhysicalProtection,
                        physicalProtectionPerLevel: god.PhysicalProtectionPerLevel,
                        speed: god.Speed,
                        abilityThumbnail1: god.godAbility1_URL,
                        abilityThumbnail2: god.godAbility2_URL,
                        abilityThumbnail3: god.godAbility3_URL,
                        abilityThumbnail4: god.godAbility4_URL,
                        abilityThumbnail5: god.godAbility5_URL,
                        basicAttack: JSON.stringify(god.basicAttack),
                        pantheon: {
                            connectOrCreate: {
                                where: {
                                    name: god.Pantheon
                                },
                                create: {
                                    name: god.Pantheon
                                }
                            }
                        }
                    }
                });
                this.container.logger.info('God ' + god.Name + ' added to the database.');
            }
        }
    }

    private async importSkins() {
        const api = new SmiteGodsApi();

        let result = await this.container.prisma.gods.findMany({
            select: {
                id: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        for (let k in result) {
            let godId = result[k].id;
            let data = await api.getSkinsByGodId(godId);

            for (let i in data) {
                let skin = data[i];

                let skinFromDb = await this.container.prisma.skins.findUnique({
                    where: {
                        id: skin.skin_id1
                    }
                });
                if (!skinFromDb) {
                    let skinName = skin.skin_name;

                    let skinFromDb = await this.container.prisma.skins.findUnique({
                        where: {
                            name: skinName
                        }
                    });

                    if (
                        skinFromDb
                        || skinName === 'Golden'
                        || skinName === 'Legendary'
                        || skinName === 'Diamond'
                    ) {
                        skinName += ` ${skin.god_name}`
                    }

                    await this.container.prisma.skins.create({
                        data: {
                            id: skin.skin_id1,
                            name: skinName,
                            godIconUrl: skin.godIcon_URL,
                            godSkinUrl: skin.godSkin_URL,
                            priceFavor: skin.price_favor,
                            priceGems: skin.price_gems,
                            obtainability: {
                                connectOrCreate: {
                                    where: {
                                        name: skin.obtainability
                                    },
                                    create: {
                                        name: skin.obtainability
                                    }
                                }
                            },
                            god: {
                                connect: {
                                    id: godId
                                }
                            }
                        }
                    });

                    this.container.logger.info('Skin ' + skinName + ' has been added to the database.');
                }
            }
        }

    }
}