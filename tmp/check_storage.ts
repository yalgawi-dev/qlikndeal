import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log("=== CHECKING STORAGE WEIGHTS ===");
    
    const storageKeys = await prisma.fieldValueReliability.findMany({ 
        where: { field: 'storage' },
        orderBy: { updatedAt: 'desc' }
    });
    console.log(`Found ${storageKeys.length} 'storage' entries.`);
    storageKeys.forEach(s => {
        console.log(`- [${s.category}] "${s.value}" | weight: ${s.confidence.toFixed(2)} | occurrences: ${s.occurrenceCount}`);
    });

    console.log("\n=== CHECKING TITLE WEIGHTS ===");
    const titles = await prisma.fieldValueReliability.findMany({ 
        where: { field: 'title' },
        orderBy: { updatedAt: 'desc' }
    });
    console.log(`Found ${titles.length} 'title' entries.`);
    titles.forEach(t => {
        console.log(`- [${t.category}] "${t.value.substring(0, 30)}..." | weight: ${t.confidence.toFixed(2)}`);
    });

    console.log("\n=== CHECKING THRESHOLDS FOR LAPTOPS ===");
    const thresh = await prisma.categoryFieldThreshold.findMany({
        where: { category: 'LAPTOPS' }
    });
    thresh.forEach(t => {
        console.log(`- ${t.field} | Fill: ${t.threshold.toFixed(2)} | Margin: ${t.suggestionMargin.toFixed(2)}`);
    });
}

check().finally(() => prisma.$disconnect());
