import { getPlayerByUserId } from '@lib/database/utils/PlayersUtils';
import { disconnectSkin, getSkinsByPlayer } from '@lib/database/utils/SkinsUtils';
import { NoxCommand } from '@lib/structures/NoxCommand';
import { NoxCommandOptions } from '@lib/structures/NoxCommandOptions';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Message, User } from 'discord.js';

@ApplyOptions<NoxCommandOptions>({
    description: 'Releases either half or all of a player\'s cards.',
    requiredUserPermissions: 'BAN_MEMBERS',
    usage: '<@user> <half|all>',
    examples: [
        '@User#1234 half',
        '@User#1234 all'
    ]
})
export class Strife extends NoxCommand {

    public async messageRun(message: Message, args: Args) {
        const user = await args.peek('user');
        if (!user) return message.reply('The first argument **must** be a user.');

        const player = await args.pick('player');
        if (!player) return message.reply('An error occured when trying to load the player.');

        let amount: string = await args.rest('string');
        amount = amount.trim();
        if (!amount || !['half', 'all'].includes(amount)) return message.reply('You need to specify of one the possible amounts.\n Either add `half` or `all` to the NoxCommand.')

        const skins = await getSkinsByPlayer(player.id);
        if (!skins || !skins.length) return message.reply(`${user} does not have any cards!`);

        let skinsToRelease = 0;
        switch (amount) {
            case 'half':
                skinsToRelease = Math.round(skins.length / 2);
                break;
            case 'all':
                skinsToRelease = skins.length;
                break;
        }

        let skinsReleased = [];
        while (skinsToRelease > 0) {
            let randomSkinIndex = Math.floor(Math.random() * skinsToRelease);
            let skin = skins[randomSkinIndex];

            await disconnectSkin(skin.id, player.id);
            this.container.logger.info(`The card ${skin.name}<${skin.id}> was released from player ${user.username}#${user.discriminator}<${user.id}>.`);

            skinsReleased.push(skin.name);
            skins.splice(randomSkinIndex, 1);
            skinsToRelease--;
        }

        let msg = `The following ${skinsReleased.length} cards were release from player ${user}:\n`;
        for (let i in skinsReleased) {
            msg += `- **${skinsReleased[i]}**\n`
        }
        msg += `They have ${skins.length} cards left in their team.`

        message.reply(msg);
    }
}