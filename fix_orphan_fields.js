const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const category = 'LAPTOPS';

async function main() {
  console.log('=== ADDING MISSING FORM FIELDS + SYNCING FVR ===\n');

  // ─── STEP 1: Rename FVR orphans to canonical fieldIds ───
  const renames = [
    { from: 'BatteryStatus',       to: 'batteryHealth' },
    { from: 'שנת דגם',             to: 'releaseYear'   },
    { from: 'טכנולוגיית מסך ',     to: 'screenType'    }, // trailing space!
    { from: 'SKU',                  to: 'sku'           },
  ];

  for (const { from, to } of renames) {
    const candles = await prisma.fieldValueReliability.findMany({ where: { category, field: from } });
    for (const c of candles) {
      const existing = await prisma.fieldValueReliability.findFirst({ where: { category, field: to, value: c.value } });
      if (existing) {
        await prisma.fieldValueReliability.update({ where: { id: existing.id }, data: { confidence: Math.max(existing.confidence, c.confidence), occurrenceCount: existing.occurrenceCount + c.occurrenceCount } });
        await prisma.fieldValueReliability.delete({ where: { id: c.id } });
      } else {
        await prisma.fieldValueReliability.update({ where: { id: c.id }, data: { field: to } });
      }
    }
    // Fix anchors
    const anchors = await prisma.fieldAnchor.findMany({ where: { category, relatedFields: { has: from } } });
    for (const a of anchors) {
      const newFields = [...new Set(a.relatedFields.map(f => f === from ? to : f))];
      await prisma.fieldAnchor.update({ where: { id: a.id }, data: { relatedFields: newFields } });
    }
    console.log(`✅ RENAMED "${from}" → "${to}" | ${candles.length} נרות, ${anchors.length} anchors`);
  }

  // ─── STEP 2: Add new CategoryFormStructure fields ───
  const newFields = [
    { fieldId: 'screenType',  labelHera: 'סוג מסך',       fieldType: 'select', order: 55, sectionName: 'מסך ותצוגה',     hint: 'IPS, OLED, AMOLED, TN, VA' },
    { fieldId: 'releaseYear', labelHera: 'שנת דגם',       fieldType: 'select', order: 75, sectionName: 'מפרט כללי',      hint: 'שנת השחרור של הדגם' },
    { fieldId: 'type',        labelHera: 'סוג מחשב',      fieldType: 'select', order: 80, sectionName: 'מפרט כללי',      hint: 'Gaming, Ultrabook, Business, Workstation' },
    { fieldId: 'sku',         labelHera: 'מק"ט / SKU',    fieldType: 'text',   order: 90, sectionName: 'מפרט כללי',      hint: 'מופיע על מדבקת המחשב / בהגדרות מערכת (msinfo32)' },
  ];

  for (const field of newFields) {
    await prisma.categoryFormStructure.upsert({
      where: { category_fieldId: { category, fieldId: field.fieldId } },
      update: { labelHera: field.labelHera, fieldType: field.fieldType, sectionName: field.sectionName },
      create: { category, fieldId: field.fieldId, labelHera: field.labelHera, fieldType: field.fieldType, order: field.order, sectionName: field.sectionName, isDynamic: false, isRequired: false }
    });
    console.log(`✅ ADDED form field: "${field.fieldId}" (${field.labelHera})`);
  }

  // ─── STEP 3: Add FormFieldOption values for new select fields ───
  const options = {
    screenType:  ['IPS', 'OLED', 'AMOLED', 'TN', 'VA', 'Mini-LED', 'Micro-LED', 'LCD'],
    releaseYear: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    type:        ['Ultrabook', 'Gaming', 'Business', 'Workstation', 'Chromebook', '2-in-1', 'Rugged', 'Creator'],
  };

  for (const [fieldId, values] of Object.entries(options)) {
    for (const value of values) {
      await prisma.formFieldOption.upsert({
        where: { category_fieldId_value: { category, fieldId, value } },
        update: {},
        create: { category, fieldId, value, isDynamic: false }
      });
    }
    console.log(`✅ SEEDED ${values.length} options for "${fieldId}"`);
  }

  // ─── STEP 4: מיקום — leave in FVR, no form field yet (future: auto-fill from profile) ───
  console.log('\n⏸️  "מיקום" — נשאר ב-FVR, יצורף לפרופיל המשתמש בעתיד');

  console.log('\n🎯 Done! Run "node debug_full_sync.js" to verify.');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
