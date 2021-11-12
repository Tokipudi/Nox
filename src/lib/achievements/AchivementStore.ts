import { Achievement } from "./Achievement";
import { Store } from "@sapphire/pieces";

export class AchievementStore extends Store<Achievement> {
    constructor() {
        super(Achievement as any, { name: 'achievements' });
    }
}