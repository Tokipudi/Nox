import { SmiteGodsApi } from '@lib/api/hirez/smite/SmiteGodsApi';
import { getGods } from '@lib/database/utils/GodsUtils';
import { getSkinByGodName } from '@lib/database/utils/SkinsUtils';
import { getGodSkinMissingData } from '@lib/utils/smite/fandom/SmiteFandomUtils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message } from 'discord.js';
import moment from 'moment';

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

        msg.edit('Skins imported. Importing missing data from <https://smite.fandom.com/>');
        this.container.logger.info('Skins imported. Importing missing data from https://smite.fandom.com/');
        await this.importFandomMissingData();

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
                        name: toTitleCase(god.Name.trim()),
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
                    let skinName = toTitleCase(skin.skin_name.trim());
                    let godIconUrl = skin.godIcon_URL;
                    let godCardURL = skin.godSkin_URL;

                    // Handle specific cases
                    if (skinName.endsWith('.')) {
                        skinName = skinName.slice(0, -1);
                    }
                    if (skinName.startsWith('Standard')) {
                        skinName = 'Default';
                    }
                    if (skinName === 'Triumphandagni') {
                        skinName = 'Triumph & Agni';
                    }
                    if (skinName === 'Blitz Athena') {
                        skinName = 'Blitz';
                    }
                    if (['Diamond', 'Legendary'].includes(skinName)) {
                        for (let j in data) {
                            let otherSkin = data[j];
                            if (toTitleCase(otherSkin.skin_name.trim()).startsWith('Golden')) {
                                godIconUrl = otherSkin.godIcon_URL;
                                godCardURL = otherSkin.godSkin_URL;
                            }
                        }
                    } else if (skinName.startsWith('Shadow')) {
                        for (let j in data) {
                            let otherSkin = data[j];
                            if (toTitleCase(otherSkin.skin_name.trim()).startsWith('Standard')) {
                                godIconUrl = otherSkin.godIcon_URL;
                                godCardURL = otherSkin.godSkin_URL;
                            }
                        }                        
                    }

                    await this.container.prisma.skins.create({
                        data: {
                            id: skin.skin_id1,
                            name: skinName,
                            godIconUrl: godIconUrl,
                            godSkinUrl: godCardURL,
                            priceFavor: skin.price_favor,
                            priceGems: skin.price_gems,
                            god: {
                                connect: {
                                    id: godId
                                }
                            }
                        }
                    });

                    this.container.logger.info('Skin ' + skinName + ' (godId<' + godId + '>) has been added to the database.');
                }
            }
        }

    }

    private async importFandomMissingData() {
        let failed = [];

        const gods = await getGods();
        for (let i in gods) {
            const god = gods[i];

            let skinsMissingData = await getGodSkinMissingData(god.name);
            for (let i in skinsMissingData) {
                let skin = skinsMissingData[i];
                let skinName = toTitleCase(skin.name.trim());

                // Handle specific cases
                if (skinName.endsWith('.')) {
                    skinName = skinName.slice(0, -1);
                }
                if (skinName === 'Classic') {
                    skinName += ` ${god.name}`;
                }
                if (skinName.startsWith('Hrx') && god.name === 'Loki') {
                    skinName = 'Hrx';
                }
                if (skinName === 'X' && god.name === 'Amaterasu') {
                    skinName = 'Amaterasu X';
                }

                const skinDb = await getSkinByGodName(god.name, skinName);
                if (!skinDb) {
                    failed.push(`Unable to find a skin with the name ${skinName} for the god ${god.name}.`);
                } else {
                    await this.container.prisma.skins.update({
                        data: {
                            releaseDate: skin.releaseDate ? moment(skin.releaseDate, 'MMMM DD, YYYY').utc().toDate() : undefined,
                            obtainability: {
                                connectOrCreate: {
                                    create: {
                                        name: skin.obtainability
                                    },
                                    where: {
                                        name: skin.obtainability
                                    }
                                }
                            }
                        },
                        where: {
                            id: skinDb.id
                        }
                    });

                    this.container.logger.info('Skin ' + skinName + ' has been updated with fandom data.');
                }
            }
        }

        if (failed.length > 0) {
            for (let i in failed) {
                let msg = failed[i];
                this.container.logger.warn(msg);
            }
        }
    }
}