import { CommandContext } from "@sapphire/framework";

export interface CommandContextWithCooldown extends CommandContext {
    remaining: number;
}