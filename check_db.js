const fs = require('fs');
const path = require('path');

// Manual .env loading
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;
            const firstEq = trimmedLine.indexOf('=');
            if (firstEq > -1) {
                const key = trimmedLine.substring(0, firstEq).trim();
                let val = trimmedLine.substring(firstEq + 1).trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (key === 'DATABASE_URL') process.env.DATABASE_URL = val;
            }
        }
    }
} catch (e) { }

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Database Content...");

    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    shipmentsAsSeller: true,
                    shipmentsAsBuyer: true
                }
            }
        }
    });

    console.log(`Found ${users.length} Users:`);
    users.forEach(u => {
        console.log(`- User: ${u.firstName} ${u.lastName}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Phone: ${u.phone || "MISSING"}`);
        console.log(`  Clerk ID: ${u.clerkId}`);
        console.log(`  Image URL: ${u.imageUrl ? "EXISTS" : "MISSING"} (${u.imageUrl?.substring(0, 30)}...)`);
        console.log(`  Shipments as Seller: ${u._count.shipmentsAsSeller}`);
        console.log(`  Shipments as Buyer: ${u._count.shipmentsAsBuyer}`);
    });

    const totalShipments = await prisma.shipment.count();
    console.log(`Total Shipments in DB: ${totalShipments}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
