import { Piece, PieceContext } from '@sapphire/pieces';
import { Snowflake } from 'discord-api-types';
import { RewardInterface, RewardOptions } from './interfaces/RewardInterface';

export abstract class Reward extends Piece implements RewardInterface {

    public label: string;
    public description?: string;
    public tokens?: number;

    constructor(context: PieceContext, options?: RewardOptions) {
        super(context, options);
        this.label = options.name.replace(/([A-Z])/g, " $1").trim();
        this.description = options.description;
        this.tokens = options.tokens;
    }

    abstract giveReward(userId: Snowflake, guildId: Snowflake): Promise<void>;
}