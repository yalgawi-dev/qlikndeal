
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const laptops = await prisma.laptopCatalog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(laptops, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
