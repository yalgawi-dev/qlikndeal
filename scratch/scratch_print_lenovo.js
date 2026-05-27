const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const listingId = "50678853-d2d5-4971-b301-b9b9a8ee178c";
    const listing = await prisma.marketplaceListing.findUnique({
        where: { id: listingId }
    });
    console.log("TITLE:", listing.title);
    console.log("DESCRIPTION:", listing.description);
    console.log("LISTING TYPE:", listing.listingType);
}

main().catch(console.error).finally(() => prisma.$disconnect());
