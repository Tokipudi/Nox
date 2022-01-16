import { Snowflake } from "discord.js";

export declare namespace PlayerNotLoadedErrorInterface {
    interface Options {
        identifier: string;
        message?: string;
        context?: Context;
    }
    interface Context {
        userId: Snowflake;
        guildId: Snowflake;
    }
}