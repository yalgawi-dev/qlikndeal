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
    console.log("Checking Catalog tables...");

    const laptopCount = await prisma.laptopCatalog.count();
    const mobileCount = await prisma.mobileCatalog.count();
    const carCount = await prisma.vehicleCatalog.count();
    const electronicCount = await prisma.electronicsCatalog.count();
    const listingCount = await prisma.marketplaceListing.count();

    console.log(`Laptops: ${laptopCount}`);
    console.log(`Mobiles: ${mobileCount}`);
    console.log(`Vehicles: ${carCount}`);
    console.log(`Electronics: ${electronicCount}`);
    console.log(`Listings: ${listingCount}`);

    console.log("\nSome Laptops:");
    const laptops = await prisma.laptopCatalog.findMany({ take: 5 });
    laptops.forEach(l => console.log(`- ${l.brand} ${l.modelName}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
