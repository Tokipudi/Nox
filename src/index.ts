import { NoxClient } from '@lib/NoxClient';

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../.env' });

const client = new NoxClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
    defaultPrefix: process.env.COMMAND_PREFIX,
});

client.login(process.env.DISCORD_TOKEN);
