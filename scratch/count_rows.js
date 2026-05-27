const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== COUNTING ROWS ===");
    const countAll = await prisma.marketplaceListing.count();
    console.log(`Total listings in DB: ${countAll}`);

    const countActive = await prisma.marketplaceListing.count({
        where: { status: "ACTIVE" }
    });
    console.log(`Active listings: ${countActive}`);

    const countActiveSell = await prisma.marketplaceListing.count({
        where: { status: "ACTIVE", listingType: "SELL" }
    });
    console.log(`Active SELL listings: ${countActiveSell}`);

    await prisma.$disconnect();
}

main().catch(console.error);
