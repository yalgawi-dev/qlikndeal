const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function seed() {
  const cat = 'SMARTPHONES';
  
  const newFields = [
    { fieldId: 'cameraMain', labelHera: 'מצלמה ראשית (MP)', fieldType: 'select', sectionName: 'מצלמה', order: 80 },
    { fieldId: 'cameraSystem', labelHera: 'מערכת מצלמות', fieldType: 'select', sectionName: 'מצלמה', order: 90 },
    { fieldId: 'hasOpticalZoom', labelHera: 'זום אופטי', fieldType: 'select', sectionName: 'מצלמה', order: 100 },
  ];
  
  for (const f of newFields) {
    await p.categoryFormStructure.upsert({
      where: { category_fieldId: { category: cat, fieldId: f.fieldId } },
      update: f,
      create: { category: cat, ...f }
    });
    console.log(`✅ Added field: ${f.fieldId}`);
  }
  
  const options = [
    { fieldId: 'cameraMain', values: ["12MP", "16MP", "48MP", "50MP", "64MP", "108MP", "200MP"] },
    { fieldId: 'cameraSystem', values: ["בודדת", "כפולה", "משולשת", "מרובעת"] },
    { fieldId: 'hasOpticalZoom', values: ["ללא זום אופטי", "זום x2", "זום x3", "זום x5", "זום x10"] },
  ];
  
  for (const { fieldId, values } of options) {
    for (const value of values) {
      await p.formFieldOption.upsert({
        where: { category_fieldId_value: { category: cat, fieldId, value } },
        update: {},
        create: { category: cat, fieldId, value, isDynamic: false }
      });
    }
    console.log(`✅ Seeded ${values.length} options for: ${fieldId}`);
  }
  
  console.log('\nSMARTPHONES camera fields done.');
}

seed().catch(console.error).finally(() => p.$disconnect());
