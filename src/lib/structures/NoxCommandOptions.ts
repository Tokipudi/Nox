import { CommandOptions } from "@sapphire/framework";

export interface NoxCommandOptions extends CommandOptions {

    usage?: string
    examples?: string[],
}