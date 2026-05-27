const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB DYNAMIC CATEGORIES ===");
    try {
        const categories = await prisma.dynamicCategory.findMany({
            where: { isActive: true }
        });
        console.log(`Found ${categories.length} active dynamic categories:`);
        categories.forEach(c => {
            console.log(`\nCode: ${c.code}`);
            console.log(`Prisma Model: ${c.prismaModel}`);
            console.log(`NLP Keywords:`, c.nlpKeywords);
            console.log(`Regex: "${c.regex}"`);
        });
    } catch (e) {
        console.error("Error reading dynamic categories:", e);
    }
    await prisma.$disconnect();
}

main().catch(console.error);
