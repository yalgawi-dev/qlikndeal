const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("MobileCatalog count:", await prisma.mobileCatalog.count());
    console.log("LaptopCatalog count:", await prisma.laptopCatalog.count());
    console.log("BrandDesktopCatalog count:", await prisma.brandDesktopCatalog.count());
    console.log("AioCatalog count:", await prisma.aioCatalog.count());
    console.log("ElectronicsCatalog count:", await prisma.electronicsCatalog.count());
    console.log("ApplianceCatalog count:", await prisma.applianceCatalog.count());
    console.log("VehicleCatalog count:", await prisma.vehicleCatalog.count());
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
