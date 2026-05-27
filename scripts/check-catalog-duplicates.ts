import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

interface DuplicateGroup {
    key: string;
    items: {
        id: string;
        label: string;
        details: any;
    }[];
}

async function checkCatalog(tableName: string, prismaModel: any, keyFields: string[], displayFn: (r: any) => string) {
    console.log(`\n======================================================`);
    console.log(`🔍 Scanning table: ${tableName}...`);
    console.log(`======================================================`);

    try {
        const rows = await prismaModel.findMany();
        console.log(`Total records: ${rows.length}`);

        const groups = new Map<string, any[]>();

        for (const row of rows) {
            // Create a normalized key from the specified keyFields
            const keyParts = keyFields.map(f => {
                const val = row[f];
                if (Array.isArray(val)) {
                    return val.map(x => String(x).toLowerCase().trim()).sort().join("|");
                }
                return String(val || "").toLowerCase().trim();
            });
            const key = keyParts.join("::");

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(row);
        }

        let duplicateCount = 0;
        let totalRedundant = 0;
        const duplicateGroups: DuplicateGroup[] = [];

        groups.forEach((items, key) => {
            if (items.length > 1) {
                duplicateCount++;
                totalRedundant += items.length - 1;
                duplicateGroups.push({
                    key,
                    items: items.map(item => ({
                        id: item.id,
                        label: displayFn(item),
                        details: item
                    }))
                });
            }
        });

        if (duplicateCount === 0) {
            console.log(`✅ No duplicates found in ${tableName}.`);
            return { tableName, duplicateGroups: [] };
        }

        console.log(`⚠️ Found ${duplicateCount} duplicate groups (${totalRedundant} redundant records) in ${tableName}:`);
        duplicateGroups.forEach((group, idx) => {
            console.log(`\nGroup #${idx + 1}: Key [${group.key}]`);
            group.items.forEach((item, itemIdx) => {
                console.log(`  [${itemIdx + 1}] ID: ${item.id} | Label: "${item.label}"`);
                // Print a summary of specs to compare
                const specKeys = Object.keys(item.details).filter(k => 
                    !["id", "createdAt", "updatedAt", "importBatchId", "constraints"].includes(k) &&
                    item.details[k] !== null &&
                    (!Array.isArray(item.details[k]) || item.details[k].length > 0)
                );
                console.log(`      Specs populated: [${specKeys.join(", ")}]`);
            });
        });

        return { tableName, duplicateGroups };
    } catch (e: any) {
        console.error(`Error scanning ${tableName}:`, e);
        return { tableName, duplicateGroups: [] };
    }
}

async function main() {
    console.log("🚀 Starting database catalog duplicate audit...\n");

    const reports: any[] = [];

    // 1. MobileCatalog
    reports.push(await checkCatalog(
        "MobileCatalog",
        prisma.mobileCatalog,
        ["brand", "series", "modelName"],
        (r) => `${r.brand} ${r.series} (${r.modelName}) | Aliases: ${JSON.stringify(r.hebrewAliases)}`
    ));

    // 2. LaptopCatalog
    reports.push(await checkCatalog(
        "LaptopCatalog",
        prisma.laptopCatalog,
        ["brand", "series", "modelName"],
        (r) => `${r.brand} ${r.series} ${r.modelName} ${r.sku || ""}`
    ));

    // 3. BrandDesktopCatalog
    reports.push(await checkCatalog(
        "BrandDesktopCatalog",
        prisma.brandDesktopCatalog,
        ["brand", "series", "modelName"],
        (r) => `${r.brand} ${r.series} ${r.modelName} ${r.sku || ""}`
    ));

    // 4. AioCatalog
    reports.push(await checkCatalog(
        "AioCatalog",
        prisma.aioCatalog,
        ["brand", "series", "modelName"],
        (r) => `${r.brand} ${r.series} ${r.modelName} ${r.sku || ""}`
    ));

    // 5. ElectronicsCatalog
    reports.push(await checkCatalog(
        "ElectronicsCatalog",
        prisma.electronicsCatalog,
        ["brand", "category", "modelName"],
        (r) => `${r.brand} [${r.category}] ${r.modelName}`
    ));

    // 6. ApplianceCatalog
    reports.push(await checkCatalog(
        "ApplianceCatalog",
        prisma.applianceCatalog,
        ["brand", "category", "modelName"],
        (r) => `${r.brand} [${r.category}] ${r.modelName}`
    ));

    // 7. VehicleCatalog
    reports.push(await checkCatalog(
        "VehicleCatalog",
        prisma.vehicleCatalog,
        ["make", "model", "year"],
        (r) => `${r.make} ${r.model} (${r.year || ""})`
    ));

    console.log(`\n======================================================`);
    console.log(`📊 Duplication Audit Summary`);
    console.log(`======================================================`);
    let totalDuplicates = 0;
    reports.forEach(r => {
        const count = r.duplicateGroups.length;
        totalDuplicates += count;
        console.log(`- ${r.tableName.padEnd(22)}: ${count > 0 ? `⚠️  ${count} duplicate groups` : "✅ Clean"}`);
    });

    if (totalDuplicates > 0) {
        console.log("\n💡 Tip: You can run the deduplication function to clean up these duplicates by keeping the record with the most populated spec fields.");
    } else {
        console.log("\n🎉 Excellent! All database catalog tables are 100% unique.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
