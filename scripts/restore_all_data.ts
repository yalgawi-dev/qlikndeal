/**
 * RESTORE SCRIPT - מחזיר את כל הנתונים שנמחקו ב-DB reset
 * מפעיל: npx ts-node --project tsconfig.seed.json scripts/restore_all_data.ts
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// ---- Import static data sources ----
import { CAR_MODELS } from "../src/lib/car-data";
import { ALL_ELECTRONICS } from "../src/lib/electronics-data";
import { MOTHERBOARD_DATABASE } from "../src/lib/motherboard-database";
import { BRAND_DESKTOPS_DATABASE, AIO_DATABASE } from "../src/lib/desktops-aio-data";

const prisma = new PrismaClient();

function toArray(val: any): string[] {
    if (!val || val === "" || val === "N/A") return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return [String(val).trim()].filter(Boolean);
}

async function restoreLaptops() {
    console.log("📦 Restoring Laptops from laptops_reconstructed.txt...");
    const filePath = path.join(__dirname, "../laptops_reconstructed.txt");
    if (!fs.existsSync(filePath)) {
        console.warn("  ⚠️  laptops_reconstructed.txt not found, skipping.");
        return;
    }
    const lines = fs.readFileSync(filePath, "utf8").split("\n").filter(l => l.trim());
    let added = 0, skipped = 0;
    for (const line of lines) {
        const parts = line.split("\t");
        if (parts.length < 8) continue;
        const [brand, series, modelName, type, screenSize, cpu, ram, storage, gpu, year, notes] = parts.map(p => p.trim());
        const autoSku = `AUTO-${brand}-${modelName}-${year}`.replace(/\s+/g, "_");
        try {
            const exists = await prisma.laptopCatalog.findFirst({
                where: { brand, modelName }
            });
            if (exists) { skipped++; continue; }
            await prisma.laptopCatalog.create({
                data: {
                    brand, series: series || "", modelName,
                    type: type || "Laptop",
                    screenSize: toArray(screenSize),
                    cpu: toArray(cpu),
                    ram: toArray(ram),
                    storage: toArray(storage),
                    gpu: toArray(gpu),
                    releaseYear: year || "",
                    notes: notes || null,
                    sku: autoSku
                }
            });
            added++;
        } catch (e: any) {
            // skip duplicates by unique constraint
            if (e.code !== "P2002") console.error(`  Error (${modelName}): ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ Laptops: added=${added}, skipped=${skipped}`);
}

async function restoreDesktops() {
    console.log("📦 Restoring Brand Desktops...");
    let added = 0, skipped = 0;
    for (const [brand, models] of Object.entries(BRAND_DESKTOPS_DATABASE)) {
        for (const family of models) {
            for (const sub of family.subModels) {
                try {
                    const exists = await prisma.brandDesktopCatalog.findFirst({
                        where: { brand, modelName: sub.name }
                    });
                    if (exists) { skipped++; continue; }
                    await prisma.brandDesktopCatalog.create({
                        data: {
                            brand, series: family.name,
                            modelName: sub.name,
                            cpu: sub.cpu || [],
                            gpu: sub.gpu || [],
                            ram: sub.ram || [],
                            storage: sub.storage || [],
                            os: sub.os || [],
                            releaseYear: sub.release_year || "",
                            notes: sub.notes || null,
                            sku: sub.sku || null,
                            ports: sub.ports || null,
                            isMini: false
                        }
                    });
                    added++;
                } catch (e: any) {
                    if (e.code !== "P2002") console.error(`  Error (${sub.name}): ${e.message}`);
                    skipped++;
                }
            }
        }
    }
    console.log(`  ✅ Desktops: added=${added}, skipped=${skipped}`);
}

async function restoreAio() {
    console.log("📦 Restoring AIO Computers...");
    let added = 0, skipped = 0;
    for (const [brand, models] of Object.entries(AIO_DATABASE)) {
        for (const family of models) {
            for (const sub of family.subModels) {
                try {
                    const exists = await prisma.aioCatalog.findFirst({
                        where: { brand, modelName: sub.name }
                    });
                    if (exists) { skipped++; continue; }
                    await prisma.aioCatalog.create({
                        data: {
                            brand, series: family.name,
                            modelName: sub.name,
                            screenSize: sub.screenSize || [],
                            cpu: sub.cpu || [],
                            gpu: sub.gpu || [],
                            ram: sub.ram || [],
                            storage: sub.storage || [],
                            os: sub.os || [],
                            releaseYear: sub.release_year || "",
                            notes: sub.notes || null,
                            sku: sub.sku || null,
                            display: Array.isArray(sub.display) ? (sub.display as string[]).join(", ") : (sub.display as string || null),
                            ports: sub.ports || null
                        }
                    });
                    added++;
                } catch (e: any) {
                    if (e.code !== "P2002") console.error(`  Error (${sub.name}): ${e.message}`);
                    skipped++;
                }
            }
        }
    }
    console.log(`  ✅ AIO: added=${added}, skipped=${skipped}`);
}

async function restoreVehicles() {
    console.log("📦 Restoring Vehicles...");
    let added = 0, skipped = 0;
    for (const [make, modelList] of Object.entries(CAR_MODELS)) {
        for (const model of modelList as string[]) {
            try {
                const exists = await prisma.vehicleCatalog.findFirst({ where: { make, model } });
                if (exists) { skipped++; continue; }
                await prisma.vehicleCatalog.create({ data: { make, model } });
                added++;
            } catch (e: any) {
                if (e.code !== "P2002") console.error(`  Error (${make} ${model}): ${e.message}`);
                skipped++;
            }
        }
    }
    console.log(`  ✅ Vehicles: added=${added}, skipped=${skipped}`);
}

async function restoreMotherboards() {
    console.log("📦 Restoring Motherboards...");
    let added = 0, skipped = 0;
    for (const mb of MOTHERBOARD_DATABASE) {
        try {
            const exists = await prisma.motherboardCatalog.findFirst({ where: { brand: mb.brand, model: mb.model } });
            if (exists) { skipped++; continue; }
            await prisma.motherboardCatalog.create({
                data: {
                    brand: mb.brand, model: mb.model,
                    chipset: mb.chipset || "", socket: mb.socket || "",
                    formFactor: mb.formFactor || "", ramType: mb.ramType || "",
                    maxRam: mb.maxRam || "", pcie: mb.pcie || "",
                    m2: mb.m2 || "", lan: mb.lan || "",
                    wifi: mb.wifi || "", releaseYear: mb.releaseYear || null
                }
            });
            added++;
        } catch (e: any) {
            if (e.code !== "P2002") console.error(`  Error (${mb.model}): ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ Motherboards: added=${added}, skipped=${skipped}`);
}

async function restoreElectronics() {
    console.log("📦 Restoring Electronics & Appliances...");
    let addedE = 0, addedA = 0, skipped = 0;
    const applianceCategories = ["מקרר", "מכונת כביסה", "מזגן", "מדיח", "Refrigerator", "Washer", "Dryer", "Dishwasher", "Air Conditioner"];
    for (const item of ALL_ELECTRONICS) {
        const isAppliance = applianceCategories.some(cat => item.category?.includes(cat));
        try {
            if (isAppliance) {
                const exists = await prisma.applianceCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.model, category: item.category }
                });
                if (exists) { skipped++; continue; }
                await prisma.applianceCatalog.create({
                    data: {
                        brand: item.brand, category: item.category, modelName: item.model,
                        hebrewAliases: item.hebrewAliases || [],
                        capacity: item.validSizes ? (item.validSizes as string[]).join("/") : null
                    }
                });
                addedA++;
            } else {
                const exists = await prisma.electronicsCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.model, category: item.category }
                });
                if (exists) { skipped++; continue; }
                await prisma.electronicsCatalog.create({
                    data: {
                        brand: item.brand, category: item.category, modelName: item.model,
                        hebrewAliases: item.hebrewAliases || [],
                        releaseYear: item.releaseYear || null,
                        specs: item.specs ? JSON.stringify(item.specs) : null
                    }
                });
                addedE++;
            }
        } catch (e: any) {
            if (e.code !== "P2002") console.error(`  Error (${item.model}): ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ Electronics: added=${addedE}, Appliances: added=${addedA}, skipped=${skipped}`);
}

async function main() {
    console.log("🚀 Starting full data restore...\n");
    await restoreLaptops();
    await restoreDesktops();
    await restoreAio();
    await restoreVehicles();
    await restoreMotherboards();
    await restoreElectronics();
    
    // Print final counts
    console.log("\n📊 Final Database Counts:");
    const [laptops, desktops, aio, vehicles, motherboards, electronics, appliances] = await Promise.all([
        prisma.laptopCatalog.count(),
        prisma.brandDesktopCatalog.count(),
        prisma.aioCatalog.count(),
        prisma.vehicleCatalog.count(),
        prisma.motherboardCatalog.count(),
        prisma.electronicsCatalog.count(),
        prisma.applianceCatalog.count()
    ]);
    console.log(`  Laptops:     ${laptops}`);
    console.log(`  Desktops:    ${desktops}`);
    console.log(`  AIO:         ${aio}`);
    console.log(`  Vehicles:    ${vehicles}`);
    console.log(`  Motherboards:${motherboards}`);
    console.log(`  Electronics: ${electronics}`);
    console.log(`  Appliances:  ${appliances}`);
    console.log("\n✅ Restore complete!");
}

main()
    .catch(e => { console.error("❌ Fatal error:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());
