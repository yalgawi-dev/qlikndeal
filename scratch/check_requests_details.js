const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DETAIL CHECK FOR ACTIVE BUYER REQUESTS ===");
    const requests = await prisma.buyerRequest.findMany({
        where: { status: "ACTIVE" }
    });
    for (const r of requests) {
        console.log(`\nID: ${r.id}`);
        console.log(`Query: "${r.query}"`);
        console.log(`UserID: ${r.userId}`);
        console.log(`ExtraData:`, r.extraData);
    }
    await prisma.$disconnect();
}

main().catch(console.error);
