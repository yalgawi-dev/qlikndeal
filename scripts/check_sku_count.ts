
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const allLaptops = await prisma.laptopCatalog.count();
    const skuLaptops = await prisma.laptopCatalog.count({
        where: {
            sku: {
                not: null
            }
        }
    });

    console.log(`Total laptops: ${allLaptops}`);
    console.log(`Laptops with SKU: ${skuLaptops}`);
    console.log(`Laptops without SKU: ${allLaptops - skuLaptops}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
