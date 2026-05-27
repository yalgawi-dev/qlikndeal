const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== STARTING OPTIMIZED DISPLAY FIELD MIGRATION ===");

  const categories = ['LAPTOPS', 'AIO'];

  // 1. Setup CategoryFormStructure for 'display'
  for (const cat of categories) {
    console.log(`Setting up form structure for category ${cat}...`);
    await prisma.categoryFormStructure.upsert({
      where: {
        category_fieldId: {
          category: cat,
          fieldId: 'display'
        }
      },
      update: {
        labelHera: "מפרט מסך",
        fieldType: "select",
        sectionName: "מסך ותצוגה",
        order: 51
      },
      create: {
        category: cat,
        fieldId: 'display',
        labelHera: "מפרט מסך",
        fieldType: "select",
        sectionName: "מסך ותצוגה",
        order: 51
      }
    });
  }

  // Helper to detect if a value is a display spec rather than a simple screen size
  function isDisplaySpec(val) {
    const specRegex = /oled|ips|hz|hd|qhd|uhd|retina|nits|matte|anti-glare|touch|p3|nebula|comfortview|sureview|wxga|wuxga|wquxga|hdr|resolution|promotion/i;
    return specRegex.test(val);
  }

  // 2. Migrate FieldValueReliability entries from 'screen' -> 'display'
  console.log("Migrating FieldValueReliability entries...");
  for (const cat of categories) {
    const screenEntries = await prisma.fieldValueReliability.findMany({
      where: { category: cat, field: 'screen' }
    });

    console.log(`Found ${screenEntries.length} screen entries in FVR for ${cat}`);
    
    for (const entry of screenEntries) {
      if (isDisplaySpec(entry.value)) {
        const existingDisplayEntry = await prisma.fieldValueReliability.findFirst({
          where: { value: entry.value, field: 'display', category: cat }
        });

        if (existingDisplayEntry) {
          await prisma.fieldValueReliability.update({
            where: { id: existingDisplayEntry.id },
            data: {
              occurrenceCount: existingDisplayEntry.occurrenceCount + entry.occurrenceCount,
              confidence: Math.max(existingDisplayEntry.confidence, entry.confidence)
            }
          });
          await prisma.fieldValueReliability.delete({
            where: { id: entry.id }
          });
        } else {
          await prisma.fieldValueReliability.update({
            where: { id: entry.id },
            data: { field: 'display' }
          });
        }
      }
    }
  }

  // 3. Migrate FormFieldOption entries from 'screen' -> 'display'
  console.log("Migrating FormFieldOption entries...");
  for (const cat of categories) {
    const screenOptions = await prisma.formFieldOption.findMany({
      where: { category: cat, fieldId: 'screen' }
    });

    console.log(`Found ${screenOptions.length} screen options in FormFieldOption for ${cat}`);

    for (const opt of screenOptions) {
      if (isDisplaySpec(opt.value)) {
        const existingDisplayOption = await prisma.formFieldOption.findFirst({
          where: { category: cat, fieldId: 'display', value: opt.value }
        });

        if (existingDisplayOption) {
          await prisma.formFieldOption.delete({
            where: { id: opt.id }
          });
        } else {
          await prisma.formFieldOption.update({
            where: { id: opt.id },
            data: { fieldId: 'display' }
          });
        }
      }
    }
  }

  // 4. Seed unique display specifications directly from the catalog
  console.log("Seeding canonical options from catalog in batches...");
  
  // A. LAPTOPS
  const laptops = await prisma.laptopCatalog.findMany({
    select: { display: true }
  });
  const laptopDisplays = new Set();
  laptops.forEach(l => {
    if (l.display && l.display.trim().length > 1) {
      laptopDisplays.add(l.display.trim());
    }
  });
  
  console.log(`Found ${laptopDisplays.size} unique display specs in LaptopCatalog. Batch seeding...`);
  const laptopSpecsArr = Array.from(laptopDisplays);

  // Batch insert FormFieldOptions
  const ffoLaptopsData = laptopSpecsArr.map(spec => ({
    category: 'LAPTOPS',
    fieldId: 'display',
    value: spec
  }));
  const ffoLaptopsResult = await prisma.formFieldOption.createMany({
    data: ffoLaptopsData,
    skipDuplicates: true
  });
  console.log(`Created/Seeded ${ffoLaptopsResult.count} FormFieldOptions for LAPTOPS.`);

  // Batch insert FieldValueReliabilities
  const fvrLaptopsData = laptopSpecsArr.map(spec => ({
    category: 'LAPTOPS',
    field: 'display',
    value: spec.toLowerCase(),
    confidence: 0.90,
    occurrenceCount: 1
  }));
  const fvrLaptopsResult = await prisma.fieldValueReliability.createMany({
    data: fvrLaptopsData,
    skipDuplicates: true
  });
  console.log(`Created/Seeded ${fvrLaptopsResult.count} FieldValueReliability entries for LAPTOPS.`);

  // B. AIO (All In One)
  const aios = await prisma.aioCatalog.findMany({
    select: { display: true }
  });
  const aioDisplays = new Set();
  aios.forEach(a => {
    if (a.display && a.display.trim().length > 1) {
      aioDisplays.add(a.display.trim());
    }
  });

  console.log(`Found ${aioDisplays.size} unique display specs in AioCatalog. Batch seeding...`);
  const aioSpecsArr = Array.from(aioDisplays);

  // Batch insert FormFieldOptions
  const ffoAioData = aioSpecsArr.map(spec => ({
    category: 'AIO',
    fieldId: 'display',
    value: spec
  }));
  const ffoAioResult = await prisma.formFieldOption.createMany({
    data: ffoAioData,
    skipDuplicates: true
  });
  console.log(`Created/Seeded ${ffoAioResult.count} FormFieldOptions for AIO.`);

  // Batch insert FieldValueReliabilities
  const fvrAioData = aioSpecsArr.map(spec => ({
    category: 'AIO',
    field: 'display',
    value: spec.toLowerCase(),
    confidence: 0.90,
    occurrenceCount: 1
  }));
  const fvrAioResult = await prisma.fieldValueReliability.createMany({
    data: fvrAioData,
    skipDuplicates: true
  });
  console.log(`Created/Seeded ${fvrAioResult.count} FieldValueReliability entries for AIO.`);

  console.log("=== DISPLAY FIELD MIGRATION COMPLETED SUCCESSFULLY ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
