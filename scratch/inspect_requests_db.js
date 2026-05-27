const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('Fetching active BuyerRequests...');
        const requests = await prisma.buyerRequest.findMany({
            include: {
                user: true
            },
            take: 10
        });
        
        console.log(`Found ${requests.length} requests:`);
        requests.forEach((r, idx) => {
            console.log(`\n--- Request #${idx + 1} ---`);
            console.log(`ID: ${r.id}`);
            console.log(`Query: "${r.query}"`);
            console.log(`User: ${r.user?.firstName} ${r.user?.lastName}`);
            console.log(`extraData:`, r.extraData);
            if (r.extraData) {
                try {
                    const parsed = JSON.parse(r.extraData);
                    console.log(`parsed extraData:`, JSON.stringify(parsed, null, 2));
                } catch (e) {
                    console.log('extraData is not JSON or parsing failed:', e.message);
                }
            }
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
