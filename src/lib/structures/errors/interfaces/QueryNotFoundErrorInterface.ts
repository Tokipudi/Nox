export declare namespace QueryNotFoundErrorInterface {
    interface Options {
        identifier: string;
        message?: string;
        context: Context;
    }
    interface Context {
        query: string;
    }
}