
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Database Counts:");
    console.log("Vehicles:", await prisma.vehicleCatalog.count());
    console.log("Electronics:", await prisma.electronicsCatalog.count());
    console.log("Appliances:", await prisma.applianceCatalog.count());
    console.log("Motherboards:", await prisma.motherboardCatalog.count());
    console.log("Laptops:", await prisma.laptopCatalog.count());
    console.log("Mobiles:", await prisma.mobileCatalog.count());
}

main().catch(console.error).finally(() => prisma.$disconnect());
