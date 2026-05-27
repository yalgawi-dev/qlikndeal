const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("Database connection starting...");
    const requests = await prisma.buyerRequest.findMany({
        include: {
            user: true
        }
    });
    console.log("\n--- BUYER REQUESTS (RADAR) WITH EXTRA DATA ---");
    for (const r of requests) {
        console.log(`ID: ${r.id}`);
        console.log(`Query: "${r.query}"`);
        console.log(`User: ${r.user?.firstName} ${r.user?.lastName} (${r.user?.email})`);
        console.log(`Status: ${r.status}`);
        console.log(`Extra Data:`, r.extraData);
        console.log("-----------------------------------------------\n");
    }
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
