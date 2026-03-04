import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function check() {
    const laptopDups = await p.$queryRaw`
        SELECT brand, "modelName", COUNT(*) as cnt 
        FROM "LaptopCatalog" 
        GROUP BY brand, "modelName" 
        HAVING COUNT(*) > 1 
        LIMIT 10
    ` as any[];

    const mobileDups = await p.$queryRaw`
        SELECT brand, "modelName", COUNT(*) as cnt 
        FROM "MobileCatalog" 
        GROUP BY brand, "modelName" 
        HAVING COUNT(*) > 1 
        LIMIT 10
    ` as any[];

    const vehicleDups = await p.$queryRaw`
        SELECT make, model, COUNT(*) as cnt 
        FROM "VehicleCatalog" 
        GROUP BY make, model 
        HAVING COUNT(*) > 1 
        LIMIT 10
    ` as any[];

    const mbDups = await p.$queryRaw`
        SELECT brand, model, COUNT(*) as cnt 
        FROM "MotherboardCatalog" 
        GROUP BY brand, model 
        HAVING COUNT(*) > 1 
        LIMIT 10
    ` as any[];

    const counts = {
        laptops: await p.laptopCatalog.count(),
        desktops: await p.brandDesktopCatalog.count(),
        aio: await p.aioCatalog.count(),
        mobile: await p.mobileCatalog.count(),
        vehicles: await p.vehicleCatalog.count(),
        motherboards: await p.motherboardCatalog.count(),
        electronics: await p.electronicsCatalog.count(),
        appliances: await p.applianceCatalog.count(),
    };

    console.log("\n📊 DB Counts:");
    Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

    console.log("\n🔍 Duplicates check:");
    console.log("  Laptops:", laptopDups.length === 0 ? "✅ Clean" : JSON.stringify(laptopDups));
    console.log("  Mobile:", mobileDups.length === 0 ? "✅ Clean" : JSON.stringify(mobileDups));
    console.log("  Vehicles:", vehicleDups.length === 0 ? "✅ Clean" : JSON.stringify(vehicleDups));
    console.log("  Motherboards:", mbDups.length === 0 ? "✅ Clean" : JSON.stringify(mbDups));

    await p.$disconnect();
}

check().catch(e => { console.error(e); p.$disconnect(); });
