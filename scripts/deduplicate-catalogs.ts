import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

// Helper to count how many fields are populated in a catalog row
function countPopulatedFields(row: any): number {
    let score = 0;
    const ignoreKeys = ["id", "createdAt", "updatedAt", "importBatchId", "constraints"];
    
    for (const key of Object.keys(row)) {
        if (ignoreKeys.includes(key)) continue;
        const val = row[key];
        if (val !== null && val !== undefined) {
            if (Array.isArray(val)) {
                if (val.length > 0) score++;
            } else if (typeof val === "string") {
                if (val.trim().length > 0) score++;
            } else {
                score++;
            }
        }
    }
    return score;
}

async function deduplicateTable(tableName: string, prismaModel: any, keyFields: string[]) {
    console.log(`\n======================================================`);
    console.log(`🧹 Deduplicating table: ${tableName}...`);
    console.log(`======================================================`);

    try {
        const rows = await prismaModel.findMany();
        console.log(`Total records before: ${rows.length}`);

        const groups = new Map<string, any[]>();

        for (const row of rows) {
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

        let deletedCount = 0;

        for (const [key, group] of groups.entries()) {
            if (group.length <= 1) continue;

            // Sort by populated fields count (descending)
            const sorted = group.map(row => ({
                row,
                score: countPopulatedFields(row)
            })).sort((a, b) => b.score - a.score);

            const winner = sorted[0].row;
            const losers = sorted.slice(1).map(x => x.row);

            console.log(`Group Key: [${key}]`);
            console.log(`  Winner: ID ${winner.id} (Populated fields: ${sorted[0].score})`);

            for (const loser of losers) {
                console.log(`  Deleting: ID ${loser.id} (Populated fields: ${countPopulatedFields(loser)})`);
                await prismaModel.delete({
                    where: { id: loser.id }
                });
                deletedCount++;
            }
        }

        console.log(`\n✅ Completed deduplication for ${tableName}. Deleted ${deletedCount} redundant records.`);
        return { tableName, deletedCount };
    } catch (e: any) {
        console.error(`Error deduplicating ${tableName}:`, e);
        return { tableName, deletedCount: 0 };
    }
}

async function main() {
    console.log("🚀 Starting database catalog deduplication surgical sweep...\n");

    const results: { tableName: string; deletedCount: number }[] = [];

    // 1. LaptopCatalog
    results.push(await deduplicateTable(
        "LaptopCatalog",
        prisma.laptopCatalog,
        ["brand", "series", "modelName"]
    ));

    // 2. BrandDesktopCatalog
    results.push(await deduplicateTable(
        "BrandDesktopCatalog",
        prisma.brandDesktopCatalog,
        ["brand", "series", "modelName"]
    ));

    // 3. AioCatalog
    results.push(await deduplicateTable(
        "AioCatalog",
        prisma.aioCatalog,
        ["brand", "series", "modelName"]
    ));

    console.log(`\n======================================================`);
    console.log(`📊 Deduplication Results Summary`);
    console.log(`======================================================`);
    let totalDeleted = 0;
    results.forEach(r => {
        totalDeleted += r.deletedCount;
        console.log(`- ${r.tableName.padEnd(22)}: Deleted ${r.deletedCount} redundant records`);
    });

    console.log(`\n🎉 Swept and cleaned! Total deleted: ${totalDeleted} records.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
