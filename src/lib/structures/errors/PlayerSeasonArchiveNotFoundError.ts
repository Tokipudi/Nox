import { PlayerSeasonArchiveNotFoundErrorInterface } from "@lib/structures/errors/interfaces/PlayerSeasonArchiveNotFoundErrorInterface";
import { NoxError } from "@lib/structures/errors/NoxError";

export class PlayerSeasonArchiveNotFoundError extends NoxError {

    public constructor(context: PlayerSeasonArchiveNotFoundErrorInterface.Context) {
        super({
            identifier: 'playerSeasonArchiveNotFoundError',
            message: 'An error occurred when trying to load the player\'s season data.',
            context: context
        });
    }
}