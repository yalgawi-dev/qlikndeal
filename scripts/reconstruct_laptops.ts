
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting reconstruction of laptop catalog...');

    // 1. Identify and keep the "new" 300 laptops (tagged with SKU- from the earlier seeding)
    // Based on earlier inspection, those don't have the 'LEGACY-' prefix in their SKU field
    // while the ones from the initial TS files (which are the ones we want to replace) do.
    
    // We'll delete all laptops where SKU starts with 'LEGACY-LAPTOP-'
    const deleteResult = await prisma.laptopCatalog.deleteMany({
        where: {
            sku: {
                startsWith: 'LEGACY-LAPTOP-'
            }
        }
    });
    console.log(`Deleted ${deleteResult.count} legacy laptop records.`);

    // 2. Read and parse the reconstructed data
    const content = fs.readFileSync('laptops_reconstructed.txt', 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() && line.includes('\t'));

    let addedCount = 0;
    let errorCount = 0;

    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length < 10) continue;

        const [brand, series, modelName, type, screenSize, cpu, ram, storage, gpu, releaseYear, notes] = parts;

        try {
            // Generate a unique SKU for these reconstructed "old" records to avoid duplicates
            // but distinct from the 'SKU-' pattern of the new 300.
            const sku = `RECONSTRUCTED-${brand}-${series}-${modelName}`.replace(/\s+/g, '-').toUpperCase();

            await prisma.laptopCatalog.upsert({
                where: { sku },
                update: {
                    brand,
                    series,
                    modelName,
                    type,
                    screenSize: [screenSize],
                    cpu: [cpu],
                    ram: [ram],
                    storage: [storage],
                    gpu: [gpu],
                    releaseYear,
                    notes
                },
                create: {
                    sku,
                    brand,
                    series,
                    modelName,
                    type,
                    screenSize: [screenSize],
                    cpu: [cpu],
                    ram: [ram],
                    storage: [storage],
                    gpu: [gpu],
                    releaseYear,
                    notes
                }
            });
            addedCount++;
        } catch (error) {
            console.error(`Error adding ${modelName}:`, error);
            errorCount++;
        }
    }

    console.log(`Reconstruction complete.`);
    console.log(`Successfully added/updated: ${addedCount}`);
    console.log(`Errors: ${errorCount}`);

    // Final count check
    const finalCount = await prisma.laptopCatalog.count();
    console.log(`Final laptop count in database: ${finalCount}`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
