import { container } from "@sapphire/pieces";
import { Achievement } from "./Achievement";

export function fetchAchievements() {
    const achievements = [];
    container.stores.get('achievements').sort((a: Achievement, b: Achievement) => {
        return a.name.localeCompare(b.name);
    }).forEach((achievement: Achievement) => {
        achievements.push(achievement);
    });

    return achievements;
}