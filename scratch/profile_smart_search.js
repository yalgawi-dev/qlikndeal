const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function profile() {
    console.log("=== PROFILING SMART SEARCH DB QUERIES ===");
    
    // Query 3a: Listing query WITHOUT seller include
    let t0 = Date.now();
    await prisma.marketplaceListing.findMany({
        where: { status: "ACTIVE", listingType: "SELL" },
        take: 60,
        orderBy: { createdAt: "desc" }
    });
    let t1 = Date.now();
    console.log(`3a. marketplaceListing.findMany (WITHOUT include) took ${t1 - t0}ms`);

    // Query 3b: Listing query WITH seller include
    let t2 = Date.now();
    await prisma.marketplaceListing.findMany({
        where: { status: "ACTIVE", listingType: "SELL" },
        include: {
            seller: {
                select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
            }
        },
        take: 60,
        orderBy: { createdAt: "desc" }
    });
    let t3 = Date.now();
    console.log(`3b. marketplaceListing.findMany (WITH include) took ${t3 - t2}ms`);
}

async function main() {
    try {
        await profile();
        console.log("\nSecond run (Hot Connection):");
        await profile();
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
