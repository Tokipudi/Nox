import { Command, CommandOptions, PieceContext } from '@sapphire/framework';
import { SmiteGodsApi } from '@lib/hirez/smite/SmiteGodsApi';
import { Message, MessageEmbed } from 'discord.js';

export class ImportDB extends Command {
    public constructor(context: PieceContext, options: CommandOptions) {
        super(context, {
            ...options,
            name: 'importdb',
            aliases: ['idb'],
            description: 'Import data to the database.'
        });
    }

    public async run(message: Message) {
        const msg = await message.reply('Fetching data from Smite\'s servers...');

        await this.importGods();

        return msg.edit('Data imported to the database.')
    }

    private async importGods() {
        const api = new SmiteGodsApi();
        const data = await api.getGods();

        for (let i in data) {
            let god = data[i];

            let godFromDb = this.container.prisma.gods.findUnique({
                where: {
                    id: god.id
                }
            });
            if (!godFromDb) {
                this.container.logger.warn(godFromDb);
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
                        godCard: god.godCard_URL,
                        godIcon: god.godIcon_URL,
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
            } else {
                this.container.logger.info('Skipped god ' + god.Name + ' because it already exists in the database!');
            }
        }
    }
}