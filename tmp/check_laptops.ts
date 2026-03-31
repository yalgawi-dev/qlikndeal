import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log("=== CHECKING RECENT LAPTOPS WEIGHTS ===");
    
    const recent = await prisma.fieldValueReliability.findMany({ 
        where: { category: 'LAPTOPS' },
        orderBy: { updatedAt: 'desc' },
        take: 15
    });
    console.log(`Found ${recent.length} recent LAPTOPS entries.`);
    recent.forEach(s => {
        console.log(`- [${s.field}] "${s.value}" | weight: ${s.confidence.toFixed(2)} | occurrences: ${s.occurrenceCount}`);
    });

    console.log("\n=== CHECKING THRESHOLDS FOR LAPTOPS ===");
    const thresh = await prisma.categoryFieldThreshold.findMany({
        where: { category: 'LAPTOPS' }
    });
    thresh.forEach(t => {
        console.log(`- ${t.field} | Fill: ${t.threshold.toFixed(2)} | Gap (Margin): ${t.suggestionMargin.toFixed(2)}`);
    });
}

check().finally(() => prisma.$disconnect());
