import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPatterns() {
    const patterns = await prisma.contextPattern.findMany({
        where: {
            OR: [
                { patternPart: { contains: "מפלצת" } },
                { patternPart: { contains: "גיימינג" } }
            ]
        },
        include: { children: true }
    });
    console.log(JSON.stringify(patterns, null, 2));

    const fields = await prisma.contextPattern.findMany({
        where: {
            AND: [
                { type: "FIELD" },
                { parentId: { not: null } }
            ]
        }
    });
    console.log("\nFields mapping to brand or family:");
    console.log(JSON.stringify(fields.filter(f => f.patternPart === 'brand' || f.patternPart === 'family'), null, 2));
}

checkPatterns()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
