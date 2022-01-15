import fetch, { FetchResultTypes } from '@sapphire/fetch';
import { sprintf } from 'sprintf-js';
import { ItemsResponse } from './interfaces/ItemsInterfaces';
import { SmiteApiSession } from './SmiteApiSession';

export class SmiteItemsApi extends SmiteApiSession {

    public async getItems() {
        if (!this.sessionId || this.sessionId === 'undefined') {
            await this.createSession();
        }

        let endpoint = 'getitems';
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
        const data = await fetch<ItemsResponse>(url, FetchResultTypes.JSON);
        console.log(url);

        return data;
    }
}