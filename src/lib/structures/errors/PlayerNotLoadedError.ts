import { PlayerNotLoadedErrorInterface } from "@lib/structures/errors/interfaces/PlayerNotLoadedErrorInterface";
import { NoxError } from "@lib/structures/errors/NoxError";

export class PlayerNotLoadedError extends NoxError {

    public constructor(context: PlayerNotLoadedErrorInterface.Context) {
        super({
            identifier: 'playerNotLoadedError',
            message: 'An error occurred when trying to load the player.',
            context: context
        });
    }
}