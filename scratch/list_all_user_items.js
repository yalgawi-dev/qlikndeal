const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== Listing ALL User items in DB ===");
    
    // Find all users containing "Yehuda" or "Algawi"
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { firstName: { contains: "Yehuda", mode: "insensitive" } },
                { lastName: { contains: "Algawi", mode: "insensitive" } },
                { lastName: { contains: "Algwi", mode: "insensitive" } }
            ]
        }
    });

    console.log(`Found ${users.length} matching users:`);
    for (const u of users) {
        console.log(`User ID: ${u.id} | Name: ${u.firstName} ${u.lastName} | Clerk ID: ${u.clerkId}`);
        
        // Find their listings in MarketplaceListing
        const listings = await prisma.marketplaceListing.findMany({
            where: { sellerId: u.clerkId }
        });
        console.log(`  MarketplaceListings count: ${listings.length}`);
        listings.forEach(l => {
            console.log(`    - ID: ${l.id} | Title: "${l.title}" | Price: ${l.price} | Type: ${l.listingType} | Status: ${l.status}`);
        });

        // Find their requests in BuyerRequest
        const requests = await prisma.buyerRequest.findMany({
            where: { userId: u.clerkId }
        });
        console.log(`  BuyerRequests count: ${requests.length}`);
        requests.forEach(r => {
            console.log(`    - ID: ${r.id} | Query: "${r.query}" | Status: ${r.status} | ExtraData: ${r.extraData}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
