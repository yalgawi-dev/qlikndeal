import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function seed() {
    console.log("Starting laptop import...");
    const data = fs.readFileSync('laptops_raw.txt', 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    let added = 0;
    let skipped = 0;

    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length < 11) continue;

        const [brand, series, modelName, type, screenSize, cpu, ram, storage, gpu, year, notes] = parts.map(p => p.trim());
        
        // Extract SKU from model name if present
        const skuMatch = modelName.match(/SKU-\d+/);
        const sku = skuMatch ? skuMatch[0] : null;

        try {
            await prisma.laptopCatalog.upsert({
                where: { sku: sku || `AUTO-${brand}-${modelName}-${year}` },
                update: {}, // Don't overwrite if SKU exists
                create: {
                    brand,
                    series,
                    modelName,
                    type,
                    screenSize: [screenSize],
                    cpu: [cpu],
                    ram: [ram],
                    storage: [storage],
                    gpu: [gpu],
                    releaseYear: year,
                    notes,
                    sku: sku || `AUTO-${brand}-${modelName}-${year}`
                }
            });
            added++;
        } catch (e) {
            console.error(`Error processing ${modelName}:`, e);
            skipped++;
        }
    }

    console.log(`Import finished! Added/Updated: ${added}, Skipped/Errors: ${skipped}`);
}

seed()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
