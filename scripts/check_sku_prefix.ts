
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const laptops = await prisma.laptopCatalog.count({
        where: {
            sku: {
                contains: 'SKU-'
            }
        }
    });
    console.log(`Laptops with SKU- prefix: ${laptops}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
