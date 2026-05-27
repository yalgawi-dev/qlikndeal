const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT ===");

    // 1. Users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true
        }
    });
    console.log(`\nTotal Users: ${users.length}`);
    users.forEach(u => {
        console.log(`User: ${u.firstName} ${u.lastName} | Email: ${u.email} | ClerkId: ${u.clerkId} | ID: ${u.id}`);
    });

    // 2. Marketplace Listings
    const listings = await prisma.marketplaceListing.findMany({
        include: {
            seller: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });
    console.log(`\nTotal Marketplace Listings: ${listings.length}`);
    listings.forEach(l => {
        console.log(`Listing ID: ${l.id} | Seller: ${l.seller?.firstName} ${l.seller?.lastName} | Title: "${l.title}" | Status: ${l.status} | Type: ${l.listingType} | CreatedAt: ${l.createdAt}`);
    });

    // 3. Buyer Requests
    const requests = await prisma.buyerRequest.findMany({
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });
    console.log(`\nTotal Buyer Requests: ${requests.length}`);
    requests.forEach(r => {
        console.log(`Request ID: ${r.id} | User: ${r.user?.firstName} ${r.user?.lastName} | Query: "${r.query}" | Status: ${r.status} | CreatedAt: ${r.createdAt}`);
    });

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
