import { Snowflake } from "discord-api-types";

export interface GodsAmountByPlayersRow {
    playerId: number,
    guildId: Snowflake,
    count: number
}
export interface GodsAmountByPlayers extends Array<GodsAmountByPlayersRow> { }

export interface GodSkinsFullNamesRow {
    fullName: string,
    godId: number,
    skinId: number
}
export interface GodSkinsFullNames extends Array<GodSkinsFullNamesRow> { }