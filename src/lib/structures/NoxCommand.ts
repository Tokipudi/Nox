import { Command } from "@sapphire/framework";
import { PieceContext } from "@sapphire/framework";
import { NoxCommandOptions } from "./NoxCommandOptions";

export abstract class NoxCommand extends Command {

    guildIds: string[];

    public constructor(context: PieceContext, options?: NoxCommandOptions) {
        super(context, options);
        this.guildIds = [
            '890643277081092117', // Nox Local
            '890917187412439040', // Nox Local 2
            '310422196998897666', // Test Bot
            '451391692176752650' // The Church
        ];
    }
}
