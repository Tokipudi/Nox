import { Interaction } from "discord.js";

export declare namespace WrongInteractionInterface {
    interface Options {
        identifier: string;
        message?: string;
        context: Context;
    }
    interface Context {
        interaction: Interaction;
    }
}