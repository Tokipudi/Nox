import { NoxClient } from '@lib/NoxClient';

import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const client = new NoxClient({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  defaultPrefix: '!',
});

client.once('ready', () => {
  console.log('Ready!');
});

client.login(process.env.DISCORD_TOKEN);
