const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    // Also delete the test record ASUS 7 Pro TEST and clear any logs with added=0 or batchId null
    const testDel = await prisma.mobileCatalog.deleteMany({ 
        where: { importBatchId: 'test' } 
    });
    console.log(`Deleted ${testDel.count} TEST records from mobileCatalog`);
    
    const count = await prisma.mobileCatalog.count();
    console.log(`Remaining mobiles: ${count}`);
}
run().catch(console.error).finally(() => prisma.$disconnect());
