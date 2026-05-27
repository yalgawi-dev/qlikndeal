const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking BuyerRequests...");
    const requests = await prisma.buyerRequest.findMany({
        take: 10,
        include: { user: true }
    });
    
    for (const req of requests) {
        console.log(`\nID: ${req.id}`);
        console.log(`Query: ${req.query}`);
        console.log(`Status: ${req.status}`);
        console.log(`User: ${req.user ? req.user.firstName + ' ' + req.user.lastName : 'None'}`);
        console.log(`ExtraData type: ${typeof req.extraData}`);
        console.log(`ExtraData:`, req.extraData);
    }
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
