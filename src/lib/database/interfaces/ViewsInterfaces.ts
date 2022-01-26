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

export interface PlayerSkinsAmountByGodRow {
    playerId: number,
    godId: number,
    skinsAmount: number
}
export interface PlayerSkinsAmountByGod extends Array<PlayerSkinsAmountByGodRow> { }

export interface GodsRoleByPlayersRow {
    guildId: Snowflake,
    playerId: number,
    godsAmount: number
}
export interface GodsRoleByPlayers extends Array<GodsRoleByPlayersRow> { }