import { CreateSessionResponse } from './interfaces/SessionResponseInterfaces';
import { container } from '@sapphire/framework';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import md5 from 'md5';
import moment from 'moment'
import { sprintf } from 'sprintf-js';

export class SmiteApiSession {

    //// Languages
    readonly language_code_english = 1
    readonly language_code_german = 2
    readonly language_code_french = 3
    readonly language_code_chinese = 5
    readonly language_code_spanish = 7
    readonly language_code_spanish_latin = 9
    readonly language_code_portuguese = 10
    readonly language_code_russian = 11
    readonly language_code_polish = 12
    readonly language_code_turkish = 13

    //// Queues
    readonly queue_id_conquest_casual = 426
    readonly queue_id_arena_casual = 435
    readonly queue_id_joust_3v3_casual = 448
    readonly queue_id_assault_casual = 445
    readonly queue_id_clash_casual = 466
    readonly queue_id_conquest_casual_console = 504
    readonly queue_id_motd_casual = 434
    readonly queue_id_conquest_ranked = 451
    readonly queue_id_siege_casual = 459
    readonly queue_id_joust_3v3_ranked_console = 503
    readonly queue_id_joust_3v3_ranked = 450
    readonly queue_id_joust_1v1_ranked_console = 502
    readonly queue_id_jous_1v1_ranked = 440

    //// Tiers
    // Bronze
    readonly tier_bronze_5 = 1
    readonly tier_bronze_4 = 2
    readonly tier_bronze_3 = 3
    readonly tier_bronze_2 = 4
    readonly tier_bronze_1 = 5
    // Silver
    readonly tier_silver_5 = 6
    readonly tier_silver_4 = 7
    readonly tier_silver_3 = 8
    readonly tier_silver_2 = 9
    readonly tier_silver_1 = 10
    //Gold
    readonly tier_gold_5 = 11
    readonly tier_gold_4 = 12
    readonly tier_gold_3 = 13
    readonly tier_gold_2 = 14
    readonly tier_gold_1 = 15
    // Platinum
    readonly tier_platinum_5 = 16
    readonly tier_platinum_4 = 17
    readonly tier_platinum_3 = 18
    readonly tier_platinum_2 = 19
    readonly tier_platinum_1 = 20
    // Diamond
    readonly tier_diamond_5 = 21
    readonly tier_diamond_4 = 22
    readonly tier_diamond_3 = 23
    readonly tier_diamond_2 = 24
    readonly tier_diamond_1 = 25
    // Master
    readonly tier_masters_1 = 26
    // Grandmaster
    readonly tier_grandmaster_1 = 27

    //// Portals
    readonly portal_id_hirez = 1
    readonly portal_id_steam = 5
    readonly portal_id_ps4 = 9
    readonly portal_id_xbox = 10
    readonly portal_id_switch = 22
    readonly portal_id_discord = 25
    readonly portal_id_epic = 28

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