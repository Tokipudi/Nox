import { NoxError } from "@lib/structures/errors/NoxError";
import { WrongInteractionInterface } from "./interfaces/WrongInteractionErrorInterface";

export class WrongInteractionError extends NoxError {

    public constructor(context: WrongInteractionInterface.Context) {
        super({
            identifier: 'wrongInteractionError',
            context: context
        });
    }
}