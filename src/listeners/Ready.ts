import { unexhaustSkinById } from '@lib/database/utils/SkinsUtils';
import { Listener } from '@sapphire/framework';
import { PieceContext } from "@sapphire/pieces";
import moment from 'moment';

export class Ready extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            once: true,
            name: 'ready'
        });
    }

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
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('arguments').size + ' arguments.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('commands').size + ' commands.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('listeners').size + ' listeners.');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('preconditions').size + ' preconditions.');

        // Update exhaust
        setInterval(async () => {
            const skins = await this.container.prisma.skins.findMany({
                where: {
                    isExhausted: true
                },
                select: {
                    id: true,
                    name: true,
                    exhaustChangeDate: true,
                    isExhausted: true
                }
            })

            for (let i in skins) {
                let skin = skins[i];
                if (moment.utc().isSameOrAfter(moment(skin.exhaustChangeDate).add(6, 'hour'))) {
                    await unexhaustSkinById(skin.id);
                    this.container.logger.info(`The skin ${skin.name}<${skin.id}> has been unexhausted.`);
                }
            }
        }, 60000);
    }
};