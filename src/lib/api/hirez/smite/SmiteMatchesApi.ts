import { SmiteApiSession } from '@lib/api/hirez/smite/SmiteApiSession';
import fetch, { FetchResultTypes } from '@sapphire/fetch';
import { sprintf } from 'sprintf-js';
import { MOTDResponse } from './interfaces/MatchesInterface';

export class SmiteMatchesApi extends SmiteApiSession {
    
    public async getMOTDs() {
        if (!this.sessionId || this.sessionId === 'undefined') {
            await this.createSession();
        }

        let endpoint = 'getmotd';
        let timestamp = this.getTimestamp();

        let url = sprintf(this.baseUrl + '%s%s/%s/%s/%s/%s',
            endpoint,
            'Json',
            this.devId,
            this.getSignature(endpoint, timestamp),
            this.sessionId,
            timestamp
        );
        const data = await fetch<MOTDResponse>(url, FetchResultTypes.JSON);

        return data;
    }
}