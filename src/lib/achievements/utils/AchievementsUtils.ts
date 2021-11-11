import fs from "fs";
import path from "path";
import { Achievement } from "../Achievement";

export async function getAchievements(): Promise<Achievement[]> {
    const paths = fs.readdirSync(path.resolve(__dirname, '../items'));

    const data = [];
    for (let p of paths) {
        const achievementClass = await import(path.resolve(__dirname, '../items/', p));
        for (let i in achievementClass) {
            const achievement: Achievement = new achievementClass[i]();
            data.push(achievement);
        }
    }

    return data;
}