import { getGodByName } from '@lib/database/utils/GodsUtils';
import { getBackButton, getForwardButton, getSelectButton } from '@lib/utils/PaginationUtils';
import { generateSkinEmbed } from '@lib/utils/smite/SmitePaginationUtils';
import { Skins } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageActionRow } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: 'List the skins of a given god.'
})
export class God extends Command {

    public async run(message: Message, args: Args) {
        const { author } = message

        let godName: string = await args.rest('string');
        godName = toTitleCase(godName);

        let god = await getGodByName(godName);
        if (!god) message.reply('Unabled to find a god with the name **' + godName + '**');

        
    }
}