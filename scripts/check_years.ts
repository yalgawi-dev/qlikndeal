
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const laptops = await prisma.laptopCatalog.findMany({
        select: {
            releaseYear: true,
        }
    });

    const counts: Record<string, number> = {};
    for (const l of laptops) {
        const year = l.releaseYear || "unknown";
        counts[year] = (counts[year] || 0) + 1;
    }

    console.log("Laptop counts by year:");
    console.log(JSON.stringify(counts, null, 2));
    console.log(`Total: ${laptops.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
