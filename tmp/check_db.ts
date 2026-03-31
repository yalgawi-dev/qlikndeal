import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    console.log("Laptops:", await prisma.laptopCatalog.count());
    console.log("Desktops:", await prisma.brandDesktopCatalog.count());
    console.log("AIO:", await prisma.aioCatalog.count());
    console.log("Phones:", await prisma.mobileCatalog.count());
    console.log("Vehicles:", await prisma.vehicleCatalog.count());
    console.log("Electronics:", await prisma.electronicsCatalog.count());
    console.log("Appliances:", await prisma.applianceCatalog.count());
    console.log("Motherboards:", await prisma.motherboardCatalog.count());
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
