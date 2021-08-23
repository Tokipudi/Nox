import { NoxClient } from '@lib/NoxClient';

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../.env' });

const client = new NoxClient({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  defaultPrefix: '!',
});

client.login(process.env.DISCORD_TOKEN);
