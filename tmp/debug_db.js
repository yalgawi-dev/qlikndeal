const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("--- DEBUG MOBILES ---");
    const mobiles = await prisma.mobileCatalog.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5 
    });
    console.log("Last 5 Mobiles:", JSON.stringify(mobiles, null, 2));

    console.log("\n--- DEBUG RECENT LOGS ---");
    const logs = await prisma.catalogImportLog.findMany({ 
        where: { category: 'mobile' }, 
        orderBy: { createdAt: 'desc' }, 
        take: 5 
    });
    console.log("Last 5 Mobile Logs:", JSON.stringify(logs, null, 2));

    console.log("\n--- DEBUG UNDO LOGIC ---");
    const lastValidLog = await prisma.catalogImportLog.findFirst({
        where: { 
            category: 'mobile', 
            batchId: { not: null },
            isUndone: false,
            added: { gt: 0 }
        },
        orderBy: { createdAt: 'desc' }
    });
    console.log("Log valid for UNDO:", lastValidLog);

    if (lastValidLog && lastValidLog.batchId) {
        const matchingRecords = await prisma.mobileCatalog.count({ 
            where: { importBatchId: lastValidLog.batchId } 
        });
        console.log("Matching records for this batch ID in mobileCatalog:", matchingRecords);
    }
}
run().catch(console.error).finally(() => prisma.$disconnect());
