const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const listingId = "50678853-d2d5-4971-b301-b9b9a8ee178c";
    console.log("Checking listing in MarketplaceListing...");
    const listing = await prisma.marketplaceListing.findUnique({
        where: { id: listingId },
        include: { seller: true }
    });
    console.log("Listing:", JSON.stringify(listing, null, 2));

    console.log("\nChecking buyerRequests for this user or similar query...");
    if (listing) {
        const buyerRequests = await prisma.buyerRequest.findMany({
            where: { userId: listing.sellerId }
        });
        console.log("Buyer Requests for this user:", JSON.stringify(buyerRequests, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
