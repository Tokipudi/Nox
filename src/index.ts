import { Client, Intents } from 'discord.js';

import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', () => {
  console.log('Ready!');
});

void client.login(process.env.DISCORD_TOKEN);
