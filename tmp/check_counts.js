
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const counts = {
        listings: await prisma.marketplaceListing.count(),
        laptops: await prisma.laptopCatalog.count(),
        mobiles: await prisma.mobileCatalog.count(),
        vehicles: await prisma.vehicleCatalog.count(),
        electronics: await prisma.electronicsCatalog.count(),
        shadowLeads: await prisma.shadowLead.count(),
        shipments: await prisma.shipment.count(),
    };
    console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
