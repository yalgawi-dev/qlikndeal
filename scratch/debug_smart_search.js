const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== Checking SearchFilterConfig table ===");
    try {
        const configs = await prisma.searchFilterConfig.findMany({ where: { isActive: true } });
        console.log(`SearchFilterConfig: ${configs.length} active records`);
    } catch (e) {
        console.error("❌ SearchFilterConfig ERROR:", e.message);
    }

    console.log("\n=== Checking BuyerRequest with full user relation ===");
    try {
        const requests = await prisma.buyerRequest.findMany({
            take: 5,
            include: { user: { select: { id: true, clerkId: true, firstName: true } } }
        });
        console.log(`Total BuyerRequests (first 5):`);
        requests.forEach(r => {
            console.log(`  ID: ${r.id}`);
            console.log(`  Query: "${r.query}"`);
            console.log(`  userId (stored): ${r.userId}`);
            console.log(`  user.id: ${r.user?.id}`);
            console.log(`  user.clerkId: ${r.user?.clerkId}`);
            console.log(`  user.firstName: ${r.user?.firstName}`);
            console.log(`  Status: ${r.status}`);
            console.log("---");
        });
    } catch (e) {
        console.error("❌ BuyerRequest ERROR:", e.message);
    }

    // Now test what smart-search would do for listingType=BUY with query=""
    console.log("\n=== Simulating smart-search for BUY type, empty query ===");
    try {
        const buyerRequests = await prisma.buyerRequest.findMany({
            where: { status: "ACTIVE" },
            include: { user: { select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true } } },
            take: 10,
            orderBy: { createdAt: "desc" }
        });
        console.log(`Found ${buyerRequests.length} active buyer requests`);
        buyerRequests.forEach(r => {
            console.log(`  - "${r.query}" | User: ${r.user?.firstName} | Has user: ${!!r.user}`);
        });
    } catch (e) {
        console.error("❌ BuyerRequest active query ERROR:", e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
