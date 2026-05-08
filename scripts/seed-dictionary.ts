import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map DB fields to the exact UI fields logic
const categoryMap: Record<string, { table: any, selectFields: string[], fieldMapping: Record<string, string> }> = {
  LAPTOPS: {
    table: prisma.laptopCatalog,
    selectFields: ['cpu', 'gpu', 'ram', 'storage'],
    fieldMapping: { cpu: 'cpu', gpu: 'gpu', ram: 'ram', storage: 'storage' }
  },
  DESKTOPS: {
    table: prisma.brandDesktopCatalog,
    selectFields: ['cpu', 'gpu', 'ram', 'storage'],
    fieldMapping: { cpu: 'cpu', gpu: 'gpu', ram: 'ram', storage: 'storage' }
  },
  CUSTOM_COMPUTERS: {
    table: prisma.customBuildCatalog,
    selectFields: ['typicalCpu', 'typicalGpu', 'typicalRam'],
    fieldMapping: { typicalCpu: 'cpu', typicalGpu: 'gpu', typicalRam: 'ram' }
  },
  AIO: {
    table: prisma.aioCatalog,
    selectFields: ['cpu', 'gpu', 'ram', 'storage'],
    fieldMapping: { cpu: 'cpu', gpu: 'gpu', ram: 'ram', storage: 'storage' }
  },
  SMARTPHONES: {
    table: prisma.mobileCatalog,
    selectFields: ['cpu', 'ramG', 'storages'],
    fieldMapping: { cpu: 'cpu', ramG: 'ram', storages: 'storage' }
  }
};

async function seedDictionaryFromCatalogs() {
  console.log("🌱 STARTING CATALOG SEEDING TO AI DICTIONARY...");
  let stats: Record<string, number> = { cpu: 0, gpu: 0, ram: 0, storage: 0 };

  for (const [category, config] of Object.entries(categoryMap)) {
    console.log(`\n📦 Processing Category: ${category}`);
    
    try {
      const allItems = await config.table.findMany({ select: config.selectFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}) });
      console.log(`   Found ${allItems.length} models in DB`);

      for (const item of allItems) {
        for (const dbField of config.selectFields) {
           const uiField = config.fieldMapping[dbField];
           const values = Array.isArray(item[dbField]) ? item[dbField] : [item[dbField]];

           for (const valRaw of values) {
              if (!valRaw) continue;
              const val = String(valRaw).trim();
              if (val.length < 2) continue;

              // Extract and normalise generic specs (like '16GB DDR4' -> '16GB')
              let normalizedVal = val;
              if (uiField === 'ram') {
                 const m = val.match(/(\d{1,3})\s*(?:GB|גיגה)/i);
                 if (m) normalizedVal = `${m[1]}GB`;
              } else if (uiField === 'storage') {
                 const m = val.match(/(\d{1,4})\s*(?:GB|TB|\u05d2\u05d9\u05d2\u05d4)/i);
                 if (m) {
                     const num = m[1];
                     const isTB = /TB/i.test(val);
                     const isHDD = /HDD/i.test(val);
                     normalizedVal = `${num}${isTB ? 'TB' : 'GB'} ${isHDD ? 'HDD' : 'SSD'}`;
                 }
              }

              // Inject robust seed to AI Dictionary
              await prisma.fieldValueReliability.upsert({
                where: {
                   value_field_category: {
                     value: normalizedVal.toLowerCase(),
                     field: uiField,
                     category: category
                   }
                },
                update: {
                   occurrenceCount: { increment: 1 },
                   confidence: 0.95, // Seed trust level (Professor confidence)
                   isIgnored: false
                },
                create: {
                   value: normalizedVal.toLowerCase(),
                   field: uiField,
                   category: category,
                   confidence: 0.95,
                   occurrenceCount: 50, // Starts high so it beats pruning
                   isIgnored: false
                }
              });
              stats[uiField]++;
           }
        }
      }
    } catch (e: any) {
       console.error(`💥 Error processing ${category}:`, e.message);
    }
  }

  console.log("\n✅ SEEDING COMPLETE!");
  console.log(`📊 Injected Terms Summary: CPU: ${stats.cpu}, GPU: ${stats.gpu}, RAM: ${stats.ram}, Storage: ${stats.storage}`);
}

seedDictionaryFromCatalogs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
