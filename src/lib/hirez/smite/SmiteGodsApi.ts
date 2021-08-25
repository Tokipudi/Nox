import fetch, { FetchResultTypes } from '@sapphire/fetch';
import type { GodsResponse } from './api/interfaces/GodsInterfaces';
import { SmiteApiSession } from './api/SmiteApiSession';
import { sprintf } from 'sprintf-js';
import { container } from '@sapphire/pieces';

export class SmiteGodsApi extends SmiteApiSession {

    public async getGods() {
        if (!this.sessionId || this.sessionId === 'undefined') {
            await this.createSession();
        }

        let endpoint = 'getgods';
        let timestamp = this.getTimestamp();

        let url = sprintf(this.baseUrl + '%s%s/%s/%s/%s/%s/%s',
            endpoint,
            'Json',
            this.devId,
            this.getSignature(endpoint, timestamp),
            this.sessionId,
            timestamp,
            this.language_code_english
        );
        const data = await fetch<GodsResponse>(url, FetchResultTypes.JSON);

        return data;
    }
}