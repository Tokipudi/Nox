import { MessageCommandContext } from "@sapphire/framework";

export interface CommandContextWithCooldown extends MessageCommandContext {
    remaining: number;
}