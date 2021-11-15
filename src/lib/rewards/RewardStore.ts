import { Store } from "@sapphire/pieces";
import { Reward } from "./Reward";

export class RewardStore extends Store<Reward> {
    constructor() {
        super(Reward as any, { name: 'rewards' });
    }
}