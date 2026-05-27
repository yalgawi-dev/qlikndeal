const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT FOR USER CORRECTIONS ===");
    try {
        const corrections = await prisma.userCorrection.findMany();
        console.log(`Total corrections in DB: ${corrections.length}`);
        corrections.forEach((c, idx) => {
            console.log(`\n--- Correction #${idx + 1} ---`);
            console.log(`ID: ${c.id}`);
            console.log(`Original Text: ${c.originalText.slice(0, 100)}...`);
            console.log(`Predicted Data:`, JSON.stringify(c.predictedData));
            console.log(`Corrected Data:`, JSON.stringify(c.correctedData));
            console.log(`Category: ${c.category}`);
        });
    } catch (e) {
        console.error("Error reading corrections:", e);
    }
    await prisma.$disconnect();
}

main().catch(console.error);
