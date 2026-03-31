import prismadb from '../src/lib/prismadb';

async function checkLastAudit() {
    const log = await prismadb.weightAuditLog.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    console.table(log ? [log] : []);
    
    const userCorrection = await prismadb.userCorrection.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    
    console.log("Last UserCorrection correctedData:", JSON.stringify(userCorrection?.correctedData, null, 2));
}

checkLastAudit().catch(console.error).finally(() => process.exit(0));
