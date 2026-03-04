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
    console.log("Checking Marketplace Listings...");

    const count = await prisma.marketplaceListing.count();
    console.log(`Total listings: ${count}`);

    const activeListings = await prisma.marketplaceListing.findMany({
        where: { status: 'ACTIVE' },
        take: 10
    });

    console.log(`Top 10 active listings:`);
    activeListings.forEach(l => {
        console.log(`- ${l.title} (₪${l.price}, ${l.category})`);
    });

    // Test a "smart search" query simulation
    const testQuery = "מחשב";
    const terms = testQuery.split(' ').filter(t => t.length > 2);
    
    const searchResults = await prisma.marketplaceListing.findMany({
        where: {
            status: 'ACTIVE',
            AND: terms.map(term => ({
                OR: [
                    { title: { contains: term, mode: 'insensitive' } },
                    { description: { contains: term, mode: 'insensitive' } },
                    { extraData: { contains: term, mode: 'insensitive' } },
                ]
            }))
        }
    });

    console.log(`Searching for "${testQuery}" found ${searchResults.length} results.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
