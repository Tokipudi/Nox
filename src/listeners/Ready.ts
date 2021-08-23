import { PieceContext } from "@sapphire/pieces";
import { Listener } from '@sapphire/framework';

export class Ready extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            once: true,
            name: 'ready'
        });
    }

    public async run() {
        console.log('__/\\\\\\\\\\_____/\\\\\\_____________________________________');
        console.log('__\\/\\\\\\\\\\\\___\\/\\\\\\_____________________________________');
        console.log('___\\/\\\\\\/\\\\\\__\\/\\\\\\_____________________________________');
        console.log('____\\/\\\\\\//\\\\\\_\\/\\\\\\_____/\\\\\\\\\\_____/\\\\\\____/\\\\\\_________');
        console.log('_____\\/\\\\\\\\//\\\\\\\\/\\\\\\___/\\\\\\///\\\\\\__\\///\\\\\\/\\\\\\/__________');
        console.log('______\\/\\\\\\_\\//\\\\\\/\\\\\\__/\\\\\\__\\//\\\\\\___\\///\\\\\\/____________');
        console.log('_______\\/\\\\\\__\\//\\\\\\\\\\\\_\\//\\\\\\__/\\\\\\_____/\\\\\\/\\\\\\___________');
        console.log('________\\/\\\\\\___\\//\\\\\\\\\\__\\///\\\\\\\\\\/____/\\\\\\/\\///\\\\\\_________');
        console.log('_________\\///_____\\/////_____\\/////_____\\///____\\///__________');
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('arguments').size + ' arguments.')
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('commands').size + ' commands.')
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('listeners').size + ' listeners.')
        this.container.logger.info('|_ Loaded ' + this.container.stores.get('preconditions').size + ' preconditions.')
    }
};