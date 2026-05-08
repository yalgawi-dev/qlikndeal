const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// מיפוי: שם שדה AI → fieldId בפורם
const FIELD_RENAME_MAP = {
  'series':     'family',   // "סדרת יצרן" in form = "family"
  'display':    'screen',   // 266 candles → map to screen
  'screenSize': 'screen',   // screen size → screen
  'title':      null,       // listing title — not a form field, DELETE
};

async function main() {
  let migrated = 0;
  let deleted = 0;

  for (const [oldField, newField] of Object.entries(FIELD_RENAME_MAP)) {
    const candles = await prisma.fieldValueReliability.findMany({
      where: { category: 'LAPTOPS', field: oldField }
    });

    if (newField === null) {
      // DELETE — not a real form field
      if (candles.length > 0) {
        await prisma.fieldValueReliability.deleteMany({
          where: { category: 'LAPTOPS', field: oldField }
        });
        console.log(`🗑️  DELETED ${candles.length} candles for ghost field "${oldField}"`);
        deleted += candles.length;
      }
    } else {
      // RENAME — migrate to correct field name
      for (const c of candles) {
        // Check if target already exists (avoid duplicate)
        const existing = await prisma.fieldValueReliability.findFirst({
          where: { category: 'LAPTOPS', field: newField, value: c.value }
        });
        if (existing) {
          // Merge: boost confidence, add occurrences
          await prisma.fieldValueReliability.update({
            where: { id: existing.id },
            data: {
              occurrenceCount: existing.occurrenceCount + c.occurrenceCount,
              confidence: Math.max(existing.confidence, c.confidence)
            }
          });
          await prisma.fieldValueReliability.delete({ where: { id: c.id } });
        } else {
          await prisma.fieldValueReliability.update({
            where: { id: c.id },
            data: { field: newField }
          });
        }
        migrated++;
      }
      console.log(`✅ MIGRATED ${candles.length} candles: "${oldField}" → "${newField}"`);
    }

    // Also fix FieldAnchor relatedFields
    const anchors = await prisma.fieldAnchor.findMany({
      where: { category: 'LAPTOPS', relatedFields: { has: oldField } }
    });
    for (const anchor of anchors) {
      if (newField === null) {
        const newFields = anchor.relatedFields.filter(f => f !== oldField);
        if (newFields.length === 0) {
          await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { isIgnored: true, relatedFields: [] } });
        } else {
          await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { relatedFields: newFields } });
        }
      } else {
        const newFields = anchor.relatedFields.map(f => f === oldField ? newField : f);
        const uniqueFields = [...new Set(newFields)];
        await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { relatedFields: uniqueFields } });
      }
    }
    if (anchors.length > 0) console.log(`  ↳ Also fixed ${anchors.length} anchors: "${oldField}" → "${newField ?? 'removed'}"`);

    // Also fix FormFieldOption
    if (newField) {
      await prisma.formFieldOption.updateMany({
        where: { category: 'LAPTOPS', fieldId: oldField },
        data: { fieldId: newField }
      });
    }
  }

  console.log(`\n🎯 Total migrated: ${migrated}, deleted: ${deleted}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
