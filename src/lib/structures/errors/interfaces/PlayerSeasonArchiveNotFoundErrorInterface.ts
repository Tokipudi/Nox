export declare namespace PlayerSeasonArchiveNotFoundErrorInterface {
    interface Options {
        identifier: string;
        message?: string;
        context?: Context;
    }
    interface Context {
        playerId: number;
        season: number;
    }
}