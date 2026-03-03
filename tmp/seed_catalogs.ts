
import { PrismaClient } from "@prisma/client";
import { CAR_MODELS } from "../src/lib/car-data";
import { ALL_ELECTRONICS } from "../src/lib/electronics-data";
import { MOTHERBOARD_DATABASE } from "../src/lib/motherboard-database";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding...");

    // 1. Seed Vehicles
    console.log("Seeding Vehicles...");
    for (const [make, models] of Object.entries(CAR_MODELS)) {
        for (const model of models) {
            await prisma.vehicleCatalog.create({
                data: { make, model }
            });
        }
    }

    // 2. Seed Electronics & Appliances
    console.log("Seeding Electronics & Appliances...");
    for (const item of ALL_ELECTRONICS) {
        const isAppliance = ["מקרר", "מכונת כביסה", "מזגן", "מדיח"].includes(item.category);
        if (isAppliance) {
            await prisma.applianceCatalog.create({
                data: {
                    brand: item.brand,
                    category: item.category,
                    modelName: item.model,
                    hebrewAliases: item.hebrewAliases || [],
                    capacity: item.validSizes ? item.validSizes.join("/") : null
                }
            });
        } else {
            await prisma.electronicsCatalog.create({
                data: {
                    brand: item.brand,
                    category: item.category,
                    modelName: item.model,
                    hebrewAliases: item.hebrewAliases || [],
                    releaseYear: item.releaseYear,
                    specs: item.specs ? JSON.stringify(item.specs) : null
                }
            });
        }
    }

    // 3. Seed Motherboards (Limit for now to avoid timeout if it's huge, or just do all)
    console.log(`Seeding Motherboards (${MOTHERBOARD_DATABASE.length} items)...`);
    console.log(`Seeding ${MOTHERBOARD_DATABASE.length} motherboards...`);
    for (const mb of MOTHERBOARD_DATABASE) {
        try {
            await prisma.motherboardCatalog.upsert({
                where: { 
                    brand_model: {
                        brand: mb.brand,
                        model: mb.model
                    }
                },
                update: {
                    chipset: mb.chipset,
                    socket: mb.socket,
                    formFactor: mb.formFactor,
                    ramType: mb.ramType,
                    maxRam: mb.maxRam,
                    pcie: mb.pcie,
                    m2: mb.m2,
                    lan: mb.lan,
                    wifi: mb.wifi,
                    releaseYear: mb.releaseYear
                },
                create: {
                    brand: mb.brand,
                    model: mb.model,
                    chipset: mb.chipset,
                    socket: mb.socket,
                    formFactor: mb.formFactor,
                    ramType: mb.ramType,
                    maxRam: mb.maxRam,
                    pcie: mb.pcie,
                    m2: mb.m2,
                    lan: mb.lan,
                    wifi: mb.wifi,
                    releaseYear: mb.releaseYear
                }
            });
        } catch (e) {
            console.error(`Error seeding MB ${mb.model}:`, e);
        }
    }
    console.log("Motherboards seeded.");

    console.log("Seeding finished successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
