import { NoxClient } from '@lib/NoxClient';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../../.env' });

const client = new NoxClient({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_MEMBERS',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'DIRECT_MESSAGE_TYPING'
    ],
    presence: {
        status: "online",
        activities: [{
            name: `Smite stuff.`,
            type: 'PLAYING',
            url: 'https://github.com/Tokipudi/Nox'
        }]
    },
    loadMessageCommandListeners: true,
    logger: {
        depth: 3
    }
});

client.login(process.env.DISCORD_TOKEN);
