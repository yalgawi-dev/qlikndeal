const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function recover() {
  const options = await p.formFieldOption.findMany({
    where: { fieldId: 'subModel' }
  });

  console.log(`Found ${options.length} subModels in catalog.`);

  let created = 0;
  for (const opt of options) {
    if (!opt.value) continue;
    const cleanValue = opt.value.toLowerCase().trim();
    if (cleanValue.length < 2) continue;
    
    try {
      await p.fieldValueReliability.upsert({
        where: {
          value_field_category: {
            value: cleanValue,
            field: 'subModel',
            category: opt.category || 'LAPTOPS'
          }
        },
        update: {},
        create: {
          value: cleanValue,
          field: 'subModel',
          category: opt.category || 'LAPTOPS',
          confidence: 0.9,
          occurrenceCount: 1,
          isIgnored: false
        }
      });
      created++;
    } catch(e) {}
  }
  
  console.log(`Recovered and explicitly synced ${created} subModels to fieldValueReliability!`);
  process.exit(0);
}

recover().catch(console.error);
