export interface MOTD {
    description: string,
    gameMode: string,
    maxPlayers: number,
    name: string,
    ret_msg: string,
    startDateTime: string,
    team1GodsCSV: string,
    team2GodsCSV: string,
    title: string
}
export interface MOTDResponse extends Array<MOTD> { }