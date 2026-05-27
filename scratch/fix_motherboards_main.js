const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SOURCE_FILE = path.join(__dirname, '../src/lib/motherboard-database.ts');
const TEMP_FILE = path.join(__dirname, 'motherboard-database-temp.js');

async function main() {
  console.log("Reading motherboard database file...");
  const rawContent = fs.readFileSync(SOURCE_FILE, 'utf8');

  // Convert export const MOTHERBOARD_DATABASE = [...] to module.exports = [...]
  let cjsContent = rawContent.replace(/export\s+const\s+MOTHERBOARD_DATABASE\s*=/, 'module.exports.MOTHERBOARD_DATABASE =');
  fs.writeFileSync(TEMP_FILE, cjsContent, 'utf8');

  console.log("Requiring temp file...");
  const { MOTHERBOARD_DATABASE } = require(TEMP_FILE);

  console.log(`Loaded ${MOTHERBOARD_DATABASE.length} motherboards from file.`);

  let fixedCount = 0;
  let skippedCount = 0;
  let unknownCount = 0;

  const cleaned = MOTHERBOARD_DATABASE.map((item, idx) => {
    const fakeBrand = item.brand;
    const model = item.model;

    // Strip the fake brand prefix
    let strippedModel = model;
    if (model.startsWith(fakeBrand + " ")) {
      strippedModel = model.substring(fakeBrand.length + 1);
    }

    const modelUpper = strippedModel.toUpperCase();
    let realBrand = fakeBrand;

    // Classification logic based on series keywords
    if (
      modelUpper.includes("ROG") ||
      modelUpper.includes("STRIX") ||
      modelUpper.includes("PRIME") ||
      modelUpper.includes("TUF") ||
      modelUpper.includes("PROART") ||
      modelUpper.includes("MAXIMUS") ||
      modelUpper.includes("HERO") ||
      modelUpper.includes("APEX") ||
      modelUpper.includes("CROSSHAIR")
    ) {
      realBrand = "ASUS";
    } else if (
      modelUpper.includes("AORUS") ||
      modelUpper.includes("AERO") ||
      modelUpper.includes("DS3H") ||
      modelUpper.includes("GAMING X") ||
      modelUpper.includes("UD") ||
      modelUpper.includes("ULTRA DURABLE") ||
      (modelUpper.includes("GAMING") && !modelUpper.includes("TUF") && !modelUpper.includes("PHANTOM") && !modelUpper.includes("PG"))
    ) {
      realBrand = "Gigabyte";
    } else if (
      modelUpper.includes("MPG") ||
      modelUpper.includes("MAG") ||
      modelUpper.includes("MEG") ||
      modelUpper.includes("TOMAHAWK") ||
      modelUpper.includes("MORTAR") ||
      modelUpper.includes("CARBON") ||
      modelUpper.includes("GODLIKE") ||
      modelUpper.includes("ACE") ||
      modelUpper.includes("UNIFY") ||
      modelUpper.includes("CREATOR") ||
      /\bPRO [BZH]\d/.test(modelUpper)
    ) {
      realBrand = "MSI";
    } else if (
      modelUpper.includes("TAICHI") ||
      modelUpper.includes("STEEL LEGEND") ||
      modelUpper.includes("PHANTOM") ||
      modelUpper.includes("RIPTIDE") ||
      modelUpper.includes("LIVEMIXER") ||
      modelUpper.includes("PRO RS") ||
      modelUpper.includes("PRO4") ||
      modelUpper.includes("PG ") ||
      modelUpper.endsWith(" PG")
    ) {
      realBrand = "ASRock";
    } else if (
      modelUpper.includes("N7") ||
      modelUpper.includes("N5")
    ) {
      realBrand = "NZXT";
    } else if (
      modelUpper.includes("DARK") ||
      modelUpper.includes("CLASSIFIED") ||
      modelUpper.includes("FTW")
    ) {
      realBrand = "EVGA";
    } else {
      unknownCount++;
    }

    const newModel = `${realBrand} ${strippedModel}`;
    if (realBrand !== fakeBrand) {
      fixedCount++;
    } else {
      skippedCount++;
    }

    return {
      ...item,
      brand: realBrand,
      model: newModel
    };
  });

  // Deduplicate cleaned records by brand and model
  const uniqueCleaned = [];
  const seenKeys = new Set();
  for (const item of cleaned) {
    const key = `${item.brand}__${item.model}`.toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueCleaned.push(item);
    }
  }

  console.log(`Summary: Fixed ${fixedCount} records, unchanged/correct: ${skippedCount}, unknown: ${unknownCount}. Unique records: ${uniqueCleaned.length} (deduplicated ${cleaned.length - uniqueCleaned.length} duplicates).`);

  // Write fixed data back to the TypeScript file
  console.log("Writing cleaned motherboards back to ts file...");
  const newTsContent = `export const MOTHERBOARD_DATABASE = ${JSON.stringify(uniqueCleaned, null, 2)};\n`;
  fs.writeFileSync(SOURCE_FILE, newTsContent, 'utf8');
  console.log("Cleaned motherboard-database.ts updated successfully!");

  // Clean up temp file
  try {
    fs.unlinkSync(TEMP_FILE);
  } catch (e) {}

  // Sync to Neon DB
  console.log("Connecting to Neon DB via Prisma...");
  const prisma = new PrismaClient();
  try {
    console.log("Wiping MotherboardCatalog table...");
    const deleteRes = await prisma.motherboardCatalog.deleteMany({});
    console.log(`Wiped ${deleteRes.count} records from database.`);

    console.log(`Seeding ${uniqueCleaned.length} cleaned motherboard records to database...`);
    let added = 0;
    
    // Insert in batches of 50 to prevent connection timeouts/limits in Serverless Neon
    const batchSize = 50;
    for (let i = 0; i < uniqueCleaned.length; i += batchSize) {
      const batch = uniqueCleaned.slice(i, i + batchSize);
      await Promise.all(batch.map(mb => 
        prisma.motherboardCatalog.create({
          data: {
            brand: mb.brand,
            model: mb.model,
            chipset: mb.chipset || "",
            socket: mb.socket || "",
            formFactor: mb.formFactor || "",
            ramType: mb.ramType || "",
            maxRam: mb.maxRam || "",
            pcie: mb.pcie || "",
            m2: mb.m2 || "",
            lan: mb.lan || "",
            wifi: mb.wifi || "",
            releaseYear: mb.releaseYear || null
          }
        })
      ));
      added += batch.length;
      console.log(`  Added ${added}/${uniqueCleaned.length} records...`);
    }

    console.log("Database catalog sync completed successfully!");
  } catch (e) {
    console.error("Database sync failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
