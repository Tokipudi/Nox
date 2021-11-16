import { Achievement } from '@lib/achievements/Achievement';
import { importFandomMissingData, importGods, importSkins } from '@lib/database/utils/ImportDatabase';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import moment from 'moment';

@ApplyOptions<ListenerOptions>({
    once: true,
    name: 'ready'
})
export class Ready extends Listener {

    public async run() {
        // Start message
        console.log('__/\\\\\\\\\\_____/\\\\\\_____________________________________');
        console.log('__\\/\\\\\\\\\\\\___\\/\\\\\\_____________________________________');
        console.log('___\\/\\\\\\/\\\\\\__\\/\\\\\\_____________________________________');
        console.log('____\\/\\\\\\//\\\\\\_\\/\\\\\\_____/\\\\\\\\\\_____/\\\\\\____/\\\\\\_________');
        console.log('_____\\/\\\\\\\\//\\\\\\\\/\\\\\\___/\\\\\\///\\\\\\__\\///\\\\\\/\\\\\\/__________');
        console.log('______\\/\\\\\\_\\//\\\\\\/\\\\\\__/\\\\\\__\\//\\\\\\___\\///\\\\\\/____________');
        console.log('_______\\/\\\\\\__\\//\\\\\\\\\\\\_\\//\\\\\\__/\\\\\\_____/\\\\\\/\\\\\\___________');
        console.log('________\\/\\\\\\___\\//\\\\\\\\\\__\\///\\\\\\\\\\/____/\\\\\\/\\///\\\\\\_________');
        console.log('_________\\///_____\\/////_____\\/////_____\\///____\\///__________');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('achievements').size + ' achievements.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('arguments').size + ' arguments.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('commands').size + ' commands.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('listeners').size + ' listeners.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('preconditions').size + ' preconditions.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('rewards').size + ' rewards.');

        // Prisma seeds
        this.container.logger.info('Starting seeding of achievements...');
        this.seedAchievements().finally(() => {
            this.container.logger.info('Achievements successfully imported into the database.');
        }).catch(e => {
            this.container.logger.error(e);
        });

        // Update player available rolls every minute
        setInterval(async () => {
            const players = await this.container.prisma.players.updateMany({
                data: {
                    rollsAvailable: 3
                },
                where: {
                    rollsAvailable: {
                        lt: 3
                    },
                    lastRollChangeDate: {
                        lte: moment.utc().subtract(1, 'hour').toDate()
                    }
                }
            });
            this.container.logger.info(`${players.count} players have had their rolls reset to 3.`);
        }, 60000);

        // Update player available claims every minute
        setInterval(async () => {
            const players = await this.container.prisma.players.updateMany({
                data: {
                    claimsAvailable: 1
                },
                where: {
                    rollsAvailable: {
                        lt: 1
                    },
                    lastClaimChangeDate: {
                        lte: moment.utc().subtract(3, 'hour').toDate()
                    }
                }
            });
            this.container.logger.info(`${players.count} players have had their claims reset to 1.`);
        }, 60000);

        // Update exhaust every minute
        setInterval(async () => {
            const playersSkins = await this.container.prisma.playersSkins.updateMany({
                data: {
                    isExhausted: false
                },
                where: {
                    isExhausted: true,
                    exhaustChangeDate: {
                        lte: moment.utc().subtract(6, 'hours').toDate()
                    }
                }
            })
            this.container.logger.info(`${playersSkins.count} skins have been unexhausted.`);
        }, 60000);

        // Update banned players every minute
        setInterval(async () => {
            const bannedPlayers = await this.container.prisma.players.updateMany({
                data: {
                    isBanned: false,
                    banStartDate: null,
                    banEndDate: null
                },
                where: {
                    banEndDate: {
                        lte: moment.utc().toDate()
                    }
                }
            });
            this.container.logger.info(`${bannedPlayers.count} have been unbanned.`);
        }, 60000);

        // Import DB every 6 hours
        setInterval(async () => {
            await importGods();
            await importSkins();
            await importFandomMissingData();
        }, 21600000);
    }

    async seedAchievements() {
        const achievements = this.container.stores.get('achievements');
        await Promise.all(
            achievements.map(async (cmd) => {
                const achievement = cmd as Achievement;

                this.container.prisma.achievements.upsert({
                    create: {
                        name: achievement.label,
                        description: achievement.description,
                        tokens: achievement.tokens
                    },
                    update: {
                        name: achievement.label,
                        description: achievement.description,
                        tokens: achievement.tokens
                    },
                    where: {
                        name: achievement.label
                    }
                }).catch((error) => {
                    console.error(error);
                });
            })
        )
    }
};