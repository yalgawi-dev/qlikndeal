const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking UserCorrection table...");
    try {
        const corrections = await prisma.userCorrection.findMany();
        console.log(`Total corrections: ${corrections.length}`);
        corrections.forEach(c => {
            console.log(JSON.stringify(c, null, 2));
        });
    } catch (e) {
        console.error("Error fetching corrections:", e);
    }
    await prisma.$disconnect();
}

main();
