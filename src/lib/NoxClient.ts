import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from "discord.js";

export class NoxClient extends SapphireClient {

	public constructor (options: ClientOptions) {
		super(options);
	}
}