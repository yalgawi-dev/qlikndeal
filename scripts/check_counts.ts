import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const laptops = await prisma.laptopCatalog.count();
    const brandDesktops = await prisma.brandDesktopCatalog.count();
    const aios = await prisma.aioCatalog.count();
    const mobiles = await prisma.mobileCatalog.count();
    const custom = await prisma.customBuildCatalog.count();

    console.log(`Laptops: ${laptops}`);
    console.log(`Brand Desktops: ${brandDesktops}`);
    console.log(`AIOs: ${aios}`);
    console.log(`Mobiles: ${mobiles}`);
    console.log(`Custom Build Categories: ${custom}`);
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
