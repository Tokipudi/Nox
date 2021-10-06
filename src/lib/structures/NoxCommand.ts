import { Command } from "@sapphire/framework";
import { PieceContext } from "@sapphire/framework";
import { NoxCommandOptions } from "./NoxCommandOptions";

export abstract class NoxCommand extends Command {

    usage: string;
    examples: string[];

    public constructor(context: PieceContext, options?: NoxCommandOptions) {
        super(context, options);
        this.usage = options.usage;
        this.examples = options.examples;
    }
}
