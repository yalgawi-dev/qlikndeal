const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Querying MarketplaceListing with listingType: BUY...");
    const buyListings = await prisma.marketplaceListing.findMany({
        where: { listingType: "BUY" }
    });
    console.log("Buy listings count:", buyListings.length);
    console.log("Listings:", JSON.stringify(buyListings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
