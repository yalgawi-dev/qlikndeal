const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const smartphoneFields = await prisma.categoryFormStructure.findMany({
            where: { category: 'SMARTPHONES' },
            orderBy: { order: 'asc' }
        });
        console.log("--- SMARTPHONES FIELDS ---");
        smartphoneFields.forEach(f => {
            console.log(`- ${f.fieldId} (${f.labelHera}) [${f.sectionName}]`);
        });
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
