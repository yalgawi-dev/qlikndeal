import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Scanning FieldValueReliability for cross-field duplicates...\n");

    const allCandles = await prisma.fieldValueReliability.findMany({
        where: { isIgnored: false },
        select: { id: true, value: true, field: true, category: true, confidence: true, occurrenceCount: true }
    });

    const valueMap = new Map<string, any[]>();

    allCandles.forEach(candle => {
        const key = `${candle.category}_${candle.value.toLowerCase().trim()}`;
        if (!valueMap.has(key)) {
            valueMap.set(key, []);
        }
        valueMap.get(key)!.push(candle);
    });

    let foundDuplicates = false;

    valueMap.forEach((candles, key) => {
        // Group by field to see if it belongs to MULTIPLE fields
        const fields = new Set(candles.map(c => c.field));
        if (fields.size > 1) {
            foundDuplicates = true;
            console.log(`⚠️ DUPLICATE FOUND: "${candles[0].value}" (Category: ${candles[0].category})`);
            candles.forEach(c => {
                console.log(`   -> Field: [${c.field.padEnd(12)}] | Conf: ${c.confidence.toFixed(2)} | Occurrences: ${c.occurrenceCount} | ID: ${c.id}`);
            });
            console.log("--------------------------------------------------");
        }
    });

    if (!foundDuplicates) {
        console.log("✅ No cross-field duplicates found in the active dictionary.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
