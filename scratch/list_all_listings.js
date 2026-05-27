const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== ALL ACTIVE MARKETPLACE LISTINGS ===");
    const listings = await prisma.marketplaceListing.findMany({
        where: { status: "ACTIVE" }
    });
    console.log(`Found ${listings.length} active listings:`);
    for (const l of listings) {
        console.log(`ID: ${l.id} | Title: "${l.title}" | Price: ₪${l.price} | SellerID: ${l.sellerId} | Category: ${l.category}`);
    }

    console.log("\n=== ALL ACTIVE BUYER REQUESTS ===");
    const requests = await prisma.buyerRequest.findMany({
        where: { status: "ACTIVE" }
    });
    console.log(`Found ${requests.length} active requests:`);
    for (const r of requests) {
        console.log(`ID: ${r.id} | Query: "${r.query}" | UserID: ${r.userId} | Status: ${r.status}`);
    }

    await prisma.$disconnect();
}

main().catch(console.error);
