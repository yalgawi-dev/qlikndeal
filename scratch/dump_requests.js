const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const requests = await prisma.buyerRequest.findMany({
        include: { user: true }
    });
    console.log("=== BUYER REQUESTS DETAILS ===");
    requests.forEach(r => {
        console.log(`\nID: ${r.id}`);
        console.log(`User: ${r.user?.firstName} ${r.user?.lastName}`);
        console.log(`Query: ${r.query}`);
        console.log(`Raw extraData: ${r.extraData}`);
        try {
            const parsed = JSON.parse(r.extraData);
            console.log("Parsed extraData:", JSON.stringify(parsed, null, 2));
        } catch(e) {
            console.log("Failed to parse extraData:", e.message);
        }
    });
    await prisma.$disconnect();
}

main();
