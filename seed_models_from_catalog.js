const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function recover() {
  console.log("Starting FAST vacuum of models from Catalogs back into AI Dictionary...");
  
  const laptopModels = await p.laptopCatalog.findMany({ select: { modelName: true } });
  const desktopModels = await p.brandDesktopCatalog.findMany({ select: { modelName: true } });
  const aioModels = await p.aioCatalog.findMany({ select: { modelName: true } });
  
  const allPC = [...laptopModels, ...desktopModels, ...aioModels];
  
  const insertData = [];
  const seen = new Set();

  for (const item of allPC) {
     if (!item.modelName) continue;
     const val = item.modelName.toLowerCase().trim();
     if (val.length < 2) continue;
     
     // Only add unique values to speed up inserts
     if (!seen.has(val)) {
        seen.add(val);
        insertData.push({
           value: val,
           field: "subModel",
           category: "LAPTOPS",
           confidence: 0.9,
           occurrenceCount: 1,
           isIgnored: false
        });
     }
  }

  // Use createMany with skipDuplicates: true for massive speed increase
  const result = await p.fieldValueReliability.createMany({
      data: insertData,
      skipDuplicates: true
  });
  
  console.log(`Successfully Vacuumed and restored ${result.count} UNIQUE subModels from the Hard Catalog back into the AI Dictionary!`);
  process.exit(0);
}

recover().catch(console.error);
