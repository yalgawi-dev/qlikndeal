const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Check MobileCatalog for Redmi Note 13
    console.log("=== MobileCatalog — Redmi Note 13 ===");
    const catalog = await prisma.mobileCatalog.findMany({
        where: { modelName: { contains: "redmi note 13", mode: "insensitive" } }
    });
    catalog.forEach(c => {
        console.log(`  Model: ${c.modelName} | Brand: ${c.brand}`);
        if (c.variants) console.log(`  Variants: ${JSON.stringify(c.variants).substring(0, 120)}`);
    });
    if (catalog.length === 0) console.log("  ❌ NOT in MobileCatalog at all");

    // 2. Check ALL listings that mention redmi/note13/note 13
    console.log("\n=== MarketplaceListing — any mention of redmi/note13 ===");
    const listings = await prisma.marketplaceListing.findMany({
        where: {
            OR: [
                { title: { contains: "redmi", mode: "insensitive" } },
                { description: { contains: "redmi", mode: "insensitive" } },
                { extraData: { contains: "redmi", mode: "insensitive" } },
                { title: { contains: "note 13", mode: "insensitive" } },
                { extraData: { contains: "note 13", mode: "insensitive" } },
                { title: { contains: "note13", mode: "insensitive" } },
            ]
        },
        include: { seller: { select: { firstName: true, clerkId: true } } }
    });
    console.log(`  Found: ${listings.length} listings`);
    listings.forEach(l => {
        console.log(`  ID: ${l.id}`);
        console.log(`  Title: "${l.title}"`);
        console.log(`  Type: ${l.listingType} | Status: ${l.status}`);
        console.log(`  Seller: ${l.seller?.firstName}`);
        if (l.extraData) {
            try {
                const ed = JSON.parse(l.extraData);
                console.log(`  ExtraData keys: ${Object.keys(ed).join(', ')}`);
                // Show model/brand
                const show = ['brand','model','modelName','cpu','ram','storage'];
                show.forEach(k => { if (ed[k]) console.log(`    ${k}: ${JSON.stringify(ed[k]).substring(0,80)}`); });
                if (ed.narrativeState) {
                    const ns = ed.narrativeState;
                    console.log(`    narrativeState.brand: ${ns.brand}`);
                    console.log(`    narrativeState.model: ${ns.model}`);
                }
            } catch {}
        }
        console.log("  ---");
    });

    // 3. Simulate what the search engine would do for "Redmi Note 13 Pro"
    console.log("\n=== Search simulation: 'Redmi Note 13 Pro' — AND keyword search ===");
    const keywords = ["Redmi", "Note", "13", "Pro"];
    const andConditions = keywords.map(term => ({
        OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { extraData: { contains: term, mode: "insensitive" } },
        ]
    }));
    const results = await prisma.marketplaceListing.findMany({
        where: { status: "ACTIVE", AND: andConditions },
    });
    console.log(`  AND-search results: ${results.length}`);
    results.forEach(r => console.log(`  - "${r.title}"`));

    // 4. Check each keyword individually to see which one fails
    console.log("\n=== Which keyword fails the AND? ===");
    for (const kw of keywords) {
        const r = await prisma.marketplaceListing.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { title: { contains: kw, mode: "insensitive" } },
                    { description: { contains: kw, mode: "insensitive" } },
                    { extraData: { contains: kw, mode: "insensitive" } },
                ]
            }
        });
        console.log(`  "${kw}": ${r.length} hits — ${r.map(x => '"' + x.title.substring(0,30) + '"').join(', ') || '(none)'}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
