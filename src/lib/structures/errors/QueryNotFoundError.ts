import { QueryNotFoundErrorInterface } from "@lib/structures/errors/interfaces/QueryNotFoundErrorInterface";
import { NoxError } from "@lib/structures/errors/NoxError";

export class QueryNotFoundError extends NoxError {

    public constructor(context: QueryNotFoundErrorInterface.Context) {
        super({
            identifier: 'queryNotFoundError',
            context: context
        });
    }
}