import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from "discord.js";
import '@sapphire/plugin-logger/register';

export class NoxClient extends SapphireClient {

	public constructor (options: ClientOptions) {
		super(options);
	}
}