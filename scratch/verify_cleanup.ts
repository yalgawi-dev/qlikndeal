import { MOTHERBOARD_DATABASE } from "../src/lib/motherboard-database";
import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("=== VERIFYING MOTHERBOARD CLEANUP ===");
  
  // 1. Verify no scrambled entries in motherboard-database.ts
  let scrambledCount = 0;
  MOTHERBOARD_DATABASE.forEach((mb: any, idx: number) => {
    const brand = mb.brand.toLowerCase();
    const model = mb.model.toLowerCase();
    
    // Check for clear mismatches
    const isMismatched = 
      (brand === 'asrock' && model.includes('mpg')) ||
      (brand === 'asrock' && model.includes('mag')) ||
      (brand === 'asrock' && model.includes('meg')) ||
      (brand === 'msi' && model.includes('strix')) ||
      (brand === 'msi' && model.includes('rog')) ||
      (brand === 'msi' && model.includes('taichi')) ||
      (brand === 'asus' && model.includes('aorus')) ||
      (brand === 'asus' && model.includes('n7')) ||
      (brand === 'nzxt' && model.includes('phantom')) ||
      (brand === 'evga' && model.includes('aorus'));
      
    if (isMismatched) {
      scrambledCount++;
      console.log(`⚠️ Scrambled record found at idx ${idx}: Brand: ${mb.brand} | Model: ${mb.model}`);
    }
  });

  if (scrambledCount === 0) {
    console.log("✅ SUCCESS: No scrambled motherboard records detected in motherboard-database.ts!");
  } else {
    console.log(`❌ FAILURE: Found ${scrambledCount} scrambled records in motherboard-database.ts!`);
  }

  console.log("\n=== VERIFYING ADDITIONAL STORAGE FIELDS ===");
  const prisma = new PrismaClient();
  try {
    const fields = await prisma.categoryFormStructure.findMany({
      where: {
        category: "CUSTOM_COMPUTERS",
        fieldId: { in: ["extraStorage1", "extraStorage2"] }
      }
    });

    if (fields.length === 2) {
      console.log("✅ SUCCESS: Both extraStorage1 and extraStorage2 registered in CategoryFormStructure!");
      fields.forEach(f => {
        console.log(` - Field: ${f.fieldId} | Label: ${f.labelHera} | Order: ${f.order}`);
      });
    } else {
      console.log(`❌ FAILURE: Found only ${fields.length}/2 registered storage fields in CategoryFormStructure!`);
    }

    const optionsCount1 = await prisma.formFieldOption.count({
      where: { category: "CUSTOM_COMPUTERS", fieldId: "extraStorage1" }
    });
    const optionsCount2 = await prisma.formFieldOption.count({
      where: { category: "CUSTOM_COMPUTERS", fieldId: "extraStorage2" }
    });

    console.log(` - extraStorage1 options count: ${optionsCount1}`);
    console.log(` - extraStorage2 options count: ${optionsCount2}`);

    if (optionsCount1 > 10 && optionsCount2 > 10) {
      console.log("✅ SUCCESS: Options populated successfully for both additional storage fields!");
    } else {
      console.log("❌ FAILURE: Options not populated correctly for additional storage fields!");
    }
  } catch (e) {
    console.error("Verification DB query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
