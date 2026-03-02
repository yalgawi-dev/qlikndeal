
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const laptops = await prisma.laptopCatalog.findMany({
        take: 10,
        select: { modelName: true, sku: true }
    });
    console.log(JSON.stringify(laptops, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
