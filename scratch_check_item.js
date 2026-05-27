const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== DB AUDIT FOR LENOVO ITEM ===");
    const item = await prisma.marketplaceListing.findUnique({
        where: { id: "50678853-d2d5-4971-b301-b9b9a8ee178c" },
        include: { seller: true }
    });
    console.log(JSON.stringify(item, null, 2));
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
