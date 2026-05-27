const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== ANALYZING COMPUTER LISTINGS IN DB ===");

    const listings = await prisma.marketplaceListing.findMany({
        where: {
            category: {
                in: ["LAPTOPS", "DESKTOPS", "Computers", "computers", "laptops", "desktops", "מחשבים", "מחשב נייד", "מחשב נייח"]
            }
        }
    });

    console.log(`Found ${listings.length} computer listings.`);
    
    listings.forEach(l => {
        console.log(`\nListing ID: ${l.id}`);
        console.log(`Title: "${l.title}"`);
        console.log(`Category: "${l.category}"`);
        console.log(`Price: ${l.price}`);
        console.log(`extraData raw: ${l.extraData}`);
        if (l.extraData) {
            try {
                const parsed = JSON.parse(l.extraData);
                console.log("extraData parsed:", parsed);
            } catch (e) {
                console.log("Failed to parse extraData JSON");
            }
        }
    });

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
