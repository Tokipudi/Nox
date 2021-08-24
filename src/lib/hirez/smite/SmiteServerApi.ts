import fetch, { FetchResultTypes } from '@sapphire/fetch';
import type { ServerStatusResponse } from './api/interfaces/SessionResponseInterfaces';
import { SmiteApiSession } from './api/SmiteApiSession';
import { sprintf } from 'sprintf-js';

export class SmiteServerApi extends SmiteApiSession {

    public async getServerStatus() {
        if (!this.sessionId || this.sessionId === 'undefined') {
            await this.createSession();
        }

        let endpoint = 'gethirezserverstatus';
        let timestamp = this.getTimestamp();

        let url = sprintf(this.baseUrl + '%s%s/%s/%s/%s/%s',
            endpoint,
            'Json',
            this.devId,
            this.getSignature(endpoint, timestamp),
            this.sessionId,
            timestamp
        );
        const data = await fetch<ServerStatusResponse>(url, FetchResultTypes.JSON);

        return data;
    }
}