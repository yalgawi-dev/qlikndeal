const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("--- Existing Phone Data (first 5) ---");
    const existing = await prisma.mobileCatalog.findMany({
        select: { brand: true, modelName: true, importBatchId: true },
        take: 5,
        orderBy: { createdAt: 'asc' }
    });
    console.log("From DB:", JSON.stringify(existing, null, 2));

    // Simulate what the file would have: 267 devices - how many match?
    // First let's check all brand/modelName combos
    const allMobiles = await prisma.mobileCatalog.findMany({
        select: { brand: true, modelName: true }
    });
    console.log(`\nTotal mobiles in DB: ${allMobiles.length}`);
    
    // Check if "ASUS Zenfone 7 Pro TEST" is in DB
    const testRecord = await prisma.mobileCatalog.findFirst({ where: { modelName: "7 Pro TEST" } });
    console.log("\nTest record ASUS 7 Pro TEST exists?", !!testRecord);
    if (testRecord) {
        console.log("importBatchId:", testRecord.importBatchId);
    }

    // What does deduplication detect?
    // The file has: "ASUS Zenfone 7 Pro" 
    // The DB has: from previous imports
    const realAsusMobile = await prisma.mobileCatalog.findFirst({ where: { brand: "ASUS", modelName: "ASUS Zenfone 7 Pro" } });
    console.log("\nASUS Zenfone 7 Pro exists in DB?", !!realAsusMobile);

    // Enumerate all current mobiles where brand+modelName would match the file
    const asusModels = await prisma.mobileCatalog.findMany({ where: { brand: "ASUS" } });
    console.log("\nAll ASUS mobiles in DB:", asusModels.map(m => ({ brand: m.brand, modelName: m.modelName })));
    
    // Total count
    const count = await prisma.mobileCatalog.count();
    console.log("\nTotal mobile count:", count);
}
run().catch(console.error).finally(() => prisma.$disconnect());
