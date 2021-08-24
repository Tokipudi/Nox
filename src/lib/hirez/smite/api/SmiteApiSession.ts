import { CreateSessionResponse } from './interfaces/SessionResponseInterfaces';
import { container } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import md5 from 'md5';
import moment from 'moment'
import { sprintf } from 'sprintf-js';

export class SmiteApiSession {

    baseUrl: string = 'https://api.smitegame.com/smiteapi.svc/';
    devId: string;
    authKey: string;
    sessionId: string;

    public constructor() {
        if (!process.env.HIREZ_DEVID) {
            container.logger.error('HIREZ_DEVID is not set!');
        }
        if (!process.env.HIREZ_AUTHKEY) {
            container.logger.error('HIREZ_AUTHKEY is not set!');
        }
        this.devId = process.env.HIREZ_DEVID;
        this.authKey = process.env.HIREZ_AUTHKEY;
    }

    protected async createSession() {
        let endpoint = 'createsession';
        let timestamp = this.getTimestamp();

        let url = sprintf(this.baseUrl + '%s%s/%s/%s/%s',
            endpoint,
            'Json',
            this.devId,
            this.getSignature(endpoint, timestamp),
            timestamp
        );
        const data = await fetch<CreateSessionResponse>(url, FetchResultTypes.JSON);
        this.sessionId = data.session_id;

        container.logger.debug('New SmiteApi session ID created: ' + this.sessionId);
    }

    protected getSignature(endpoint: string, timestamp: string): string {
        return md5(
            this.devId +
            endpoint +
            this.authKey +
            timestamp
        );
    }

    protected getTimestamp(format = 'YYYYMMDDHHmmss'): string {
        return moment().utc().format(format);
    }
}