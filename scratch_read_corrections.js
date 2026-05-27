const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT FOR USER CORRECTIONS & LENOVO ===");

    // 1. Fetch corrections
    try {
        const corrections = await prisma.userCorrection.findMany();
        console.log(`Total corrections: ${corrections.length}`);
        corrections.forEach(c => {
            console.log(JSON.stringify(c, null, 2));
        });
    } catch (e) {
        console.error("Error reading corrections:", e);
    }

    // 2. Search for Lenovo in MarketplaceListing
    try {
        const listings = await prisma.marketplaceListing.findMany({
            where: {
                OR: [
                    { title: { contains: "Lenovo", mode: "insensitive" } },
                    { description: { contains: "Lenovo", mode: "insensitive" } }
                ]
            }
        });
        console.log(`\nFound ${listings.length} Lenovo items in MarketplaceListing:`);
        listings.forEach(l => {
            console.log(`ID: ${l.id} | Title: "${l.title}" | Status: ${l.status} | Type: ${l.listingType} | CreatedAt: ${l.createdAt}`);
        });
    } catch (e) {
        console.error("Error searching MarketplaceListing:", e);
    }

    // 3. Search for Lenovo in BuyerRequest
    try {
        const requests = await prisma.buyerRequest.findMany({
            where: {
                query: { contains: "Lenovo", mode: "insensitive" }
            }
        });
        console.log(`\nFound ${requests.length} Lenovo items in BuyerRequest:`);
        requests.forEach(r => {
            console.log(`ID: ${r.id} | Query: "${r.query}" | Status: ${r.status} | CreatedAt: ${r.createdAt}`);
        });
    } catch (e) {
        console.error("Error searching BuyerRequest:", e);
    }

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
