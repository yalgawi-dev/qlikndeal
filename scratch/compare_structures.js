const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const laptopFields = await prisma.categoryFormStructure.findMany({
            where: { category: 'LAPTOPS' },
            orderBy: { order: 'asc' }
        });
        console.log("--- LAPTOPS FIELDS ---");
        laptopFields.forEach(f => {
            console.log(`- ${f.fieldId} (${f.labelHera}) [${f.sectionName}]`);
        });

        const aioFields = await prisma.categoryFormStructure.findMany({
            where: { category: 'AIO' },
            orderBy: { order: 'asc' }
        });
        console.log("\n--- AIO FIELDS ---");
        aioFields.forEach(f => {
            console.log(`- ${f.fieldId} (${f.labelHera}) [${f.sectionName}]`);
        });
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
