const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== SHIPMENTS AUDIT ===");
    const shipments = await prisma.shipment.findMany({
        include: {
            seller: true,
            buyer: true,
            details: true
        }
    });

    console.log(`Total Shipments: ${shipments.length}`);
    shipments.forEach(s => {
        console.log(`Shipment ID: ${s.id} | ShortID: ${s.shortId}`);
        console.log(`  Seller: ${s.seller?.firstName} ${s.seller?.lastName} (${s.sellerId})`);
        console.log(`  Buyer: ${s.buyer?.firstName} ${s.buyer?.lastName} (${s.buyerId})`);
        console.log(`  Status: ${s.status}`);
        console.log(`  Item: ${s.details?.itemName} | Value: ${s.details?.value}`);
    });

    await prisma.$disconnect();
}

main();
