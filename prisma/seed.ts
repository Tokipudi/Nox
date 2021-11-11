import { PrismaClient } from '@prisma/client';
import { getAchievements } from '../build/src/lib/achievements/utils/AchievementsUtils';
import { Achievement } from '../build/src/lib/achievements/Achievement';

const prisma = new PrismaClient();

async function seed() {
    const achievements: Achievement[] = await getAchievements();
    for (let i in achievements) {
        const achievement = achievements[i];

        prisma.achievements.upsert({
            create: {
                name: achievement.achievementName,
                description: achievement.description,
                tokens: achievement.tokens
            },
            update: {
                name: achievement.achievementName,
                description: achievement.description,
                tokens: achievement.tokens
            },
            where: {
                name: achievement.achievementName
            }
        }).catch((error) => {
            console.error(error);
        });
    }
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect()
    });