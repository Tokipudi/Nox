import { Command } from "@sapphire/framework";
import { PieceContext } from "@sapphire/framework";
import { NoxCommandOptions } from "./NoxCommandOptions";

export abstract class NoxCommand extends Command {

    public constructor(context: PieceContext, options?: NoxCommandOptions) {
        super(context, options);
    }
}
