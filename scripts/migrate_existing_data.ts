import { PrismaClient } from '@prisma/client';
import { LAPTOP_DATABASE, BRAND_DESKTOP_DATABASE, ALL_IN_ONE_DATABASE } from '../src/lib/computer-data';
import { ALL_PHONES } from '../src/lib/phone-data';

const prisma = new PrismaClient();

async function migrate() {
    console.log("Cleaning up catalog tables...");
    await prisma.laptopCatalog.deleteMany({});
    await prisma.brandDesktopCatalog.deleteMany({});
    await prisma.customBuildCatalog.deleteMany({});
    await prisma.aioCatalog.deleteMany({});
    await prisma.mobileCatalog.deleteMany({});
    console.log("Cleanup complete.");

    console.log("Migrating existing data from data files...");

    // 1. Migrate Laptops
    let laptopCount = 0;
    for (const [brand, families] of Object.entries(LAPTOP_DATABASE)) {
        for (const family of families) {
            for (const sub of family.subModels) {
                const sku = `LEGACY-LAPTOP-${brand}-${sub.name}`.replace(/\s+/g, '-');
                await prisma.laptopCatalog.upsert({
                    where: { sku },
                    update: {},
                    create: {
                        brand,
                        series: family.name,
                        modelName: sub.name,
                        screenSize: sub.screenSize || [],
                        cpu: sub.cpu || [],
                        gpu: sub.gpu || [],
                        ram: sub.ram || [],
                        storage: sub.storage || [],
                        os: sub.os || [],
                        releaseYear: sub.release_year,
                        notes: sub.notes,
                        sku
                    }
                });
                laptopCount++;
            }
        }
    }
    console.log(`Migrated ${laptopCount} laptops.`);

    // 2. Migrate Brand Desktops
    let desktopCount = 0;
    for (const [brand, families] of Object.entries(BRAND_DESKTOP_DATABASE)) {
        for (const family of families) {
            for (const sub of family.subModels) {
                const sku = `LEGACY-DESKTOP-${brand}-${sub.name}`.replace(/\s+/g, '-');
                await prisma.brandDesktopCatalog.upsert({
                    where: { sku },
                    update: {},
                    create: {
                        brand,
                        series: family.name,
                        modelName: sub.name,
                        cpu: sub.cpu || [],
                        gpu: sub.gpu || [],
                        ram: sub.ram || [],
                        storage: sub.storage || [],
                        os: sub.os || [],
                        releaseYear: sub.release_year,
                        notes: sub.notes,
                        sku,
                        isMini: family.type === "mini pc"
                    }
                });
                desktopCount++;
            }
        }
    }
    console.log(`Migrated ${desktopCount} brand desktops.`);

    // 3. Migrate AIOs
    let aioCount = 0;
    for (const [brand, families] of Object.entries(ALL_IN_ONE_DATABASE)) {
        for (const family of families) {
            for (const sub of family.subModels) {
                const sku = `LEGACY-AIO-${brand}-${sub.name}`.replace(/\s+/g, '-');
                await prisma.aioCatalog.upsert({
                    where: { sku },
                    update: {},
                    create: {
                        brand,
                        series: family.name,
                        modelName: sub.name,
                        screenSize: sub.screenSize || [],
                        cpu: sub.cpu || [],
                        gpu: sub.gpu || [],
                        ram: sub.ram || [],
                        storage: sub.storage || [],
                        os: sub.os || [],
                        releaseYear: sub.release_year,
                        notes: sub.notes,
                        sku
                    }
                });
                aioCount++;
            }
        }
    }
    console.log(`Migrated ${aioCount} AIOs.`);

    // 4. Migrate Mobile
    let mobileCount = 0;
    for (const phone of ALL_PHONES) {
        const sku = `LEGACY-MOBILE-${phone.brand}-${phone.model}`.replace(/\s+/g, '-');
        await prisma.mobileCatalog.upsert({
            where: { id: sku }, // Use as ID for simplicity if needed, but schema has @id default(uuid)
            update: {},
            create: {
                brand: phone.brand,
                series: phone.series,
                modelName: phone.model,
                hebrewAliases: phone.hebrewAliases || [],
                storages: phone.storages,
                screenSize: phone.screen,
                releaseYear: phone.releaseYear,
                cpu: phone.cpu,
                ramG: phone.ram,
                os: phone.os,
                battery: phone.battery,
                rearCamera: phone.rear_camera,
                frontCamera: phone.front_camera,
                weight: phone.weight,
                nfc: phone.nfc || false,
                wirelessCharging: phone.wireless_charging || false
            }
        });
        mobileCount++;
    }
    console.log(`Migrated ${mobileCount} mobile models.`);
    
    // 5. Custom Builds (Static ones if any)
    const customBuilds = [
      { category: "Gaming", subCategory: "High-End", description: "מחשב גיימינג עוצמתי להרכבה" },
      { category: "Office", subCategory: "Standard", description: "מחשב משרדי אמין" },
      { category: "Workstation", subCategory: "Professional", description: "תחנת עבודה לעריכה ותכנון" },
    ];
    for (const cb of customBuilds) {
      await prisma.customBuildCatalog.create({ data: cb });
    }
    console.log(`Created ${customBuilds.length} custom build categories.`);
}

migrate()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
