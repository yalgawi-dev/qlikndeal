const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping: Hebrew/legacy keys -> standardized keys in form
const EXTRA_DATA_KEY_MAP = {
    "RAM": "ram",
    "ram": "ram",
    "זיכרון (RAM)": "ram",
    "זיכרון": "ram",
    "מעבד": "cpu",
    "cpu": "cpu",
    "כרטיס מסך": "gpu",
    "gpu": "gpu",
    "נפח אחסון": "storage",
    "storage": "storage",
    "אחסון": "storage",
    "גודל מסך": "screen",
    "screenSize": "screen",
    "screen": "screen",
    "מערכת הפעלה": "os",
    "os": "os",
    "יצרן": "brand",
    "brand": "brand",
    "דגם": "subModel",
    "subModel": "subModel",
    "submodel": "subModel",
    "model_name": "subModel",
    "סדרה": "family",
    "family": "family"
};

async function main() {
    console.log("=== NORMALIZING EXTRADATA KEYS ===");

    const listings = await prisma.marketplaceListing.findMany({
        where: {
            category: {
                in: ["LAPTOPS", "DESKTOPS"]
            }
        }
    });

    console.log(`Found ${listings.length} computer listings.`);
    let updatedCount = 0;

    for (const l of listings) {
        if (!l.extraData) continue;

        try {
            const parsed = JSON.parse(l.extraData);
            const normalized = {};
            let changed = false;

            Object.entries(parsed).forEach(([key, value]) => {
                const mappedKey = EXTRA_DATA_KEY_MAP[key];
                if (mappedKey) {
                    if (mappedKey !== key) {
                        normalized[mappedKey] = value;
                        changed = true;
                    } else {
                        normalized[key] = value;
                    }
                } else {
                    normalized[key] = value;
                }
            });

            if (changed) {
                await prisma.marketplaceListing.update({
                    where: { id: l.id },
                    data: {
                        extraData: JSON.stringify(normalized)
                    }
                });
                console.log(`Updated Listing "${l.title}" (ID: ${l.id}) extraData:`);
                console.log("  Old:", parsed);
                console.log("  New:", normalized);
                updatedCount++;
            }
        } catch (e) {
            console.error(`Failed to parse extraData for listing ${l.id}:`, e.message);
        }
    }

    console.log(`\nSuccessfully normalized extraData keys for ${updatedCount} listings.`);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
