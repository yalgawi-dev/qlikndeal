const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== NORMALIZING LISTING CATEGORIES ===");

    const listings = await prisma.marketplaceListing.findMany({
        where: {
            category: {
                in: [
                    "Computers", "computers", "laptops", "desktops", 
                    "מחשבים", "מחשב נייד", "מחשב נייח", "Laptop", "Desktop"
                ]
            }
        }
    });

    console.log(`Found ${listings.length} listings with non-standardized categories.`);

    let updatedCount = 0;

    for (const l of listings) {
        let targetCategory = "LAPTOPS"; // fallback
        const combinedText = `${l.title} ${l.description || ""} ${l.category || ""} ${l.extraData || ""}`.toLowerCase();
        
        // Check if desktop
        const isDesktop = [
            "נייח", "שולחני", "desktop", "מארז", "tower", 
            "all-in-one", "aio", "mac mini", "mac pro", "mac studio", "imac"
        ].some(term => combinedText.includes(term));

        if (isDesktop) {
            targetCategory = "DESKTOPS";
        } else {
            targetCategory = "LAPTOPS";
        }

        await prisma.marketplaceListing.update({
            where: { id: l.id },
            data: { category: targetCategory }
        });

        console.log(`Updated Listing "${l.title}" (ID: ${l.id}): Category "${l.category}" -> "${targetCategory}"`);
        updatedCount++;
    }

    console.log(`\nSuccessfully normalized ${updatedCount} listings.`);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
