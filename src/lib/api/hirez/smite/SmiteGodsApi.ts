import fetch, { FetchResultTypes } from '@sapphire/fetch';
import type { GodsResponse, SkinsResponse } from './interfaces/GodsInterfaces';
import { SmiteApiSession } from './SmiteApiSession';
import { sprintf } from 'sprintf-js';

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

    public async getSkinsByGodId(godId: number) {
        if (!this.sessionId || this.sessionId === 'undefined') {
            await this.createSession();
        }

        let endpoint = 'getgodskins';
        let timestamp = this.getTimestamp();

        let url = sprintf(this.baseUrl + '%s%s/%s/%s/%s/%s/%s/%s',
            endpoint,
            'Json',
            this.devId,
            this.getSignature(endpoint, timestamp),
            this.sessionId,
            timestamp,
            godId,
            this.language_code_english
        );
        const data = await fetch<SkinsResponse>(url, FetchResultTypes.JSON);

        return data;
    }
}