const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SIGNAL_FIELD_RENAMES = {
  'מעבד ':           'cpu',
  'כרטיס מסך ':     'gpu',
  'רזלוציית מסך ':  'screen',
  'טכנולוגיית מסך ':'screenType',
  'שנת דגם':         'releaseYear',
  'SKU':              'sku',
  'BatteryStatus':    'batteryHealth',
};
const SIGNAL_DELETE_FIELDS = ['title']; // Not a form field

async function main() {
  let fixed = 0;

  // ─── Rename FieldSignal fields ───
  for (const [oldField, newField] of Object.entries(SIGNAL_FIELD_RENAMES)) {
    const signals = await prisma.fieldSignal.findMany({
      where: { category: 'LAPTOPS', field: oldField }
    });
    for (const s of signals) {
      // Check if target already exists (avoid duplicate)
      const existing = await prisma.fieldSignal.findFirst({
        where: { category: 'LAPTOPS', field: newField, rawValue: s.rawValue }
      });
      if (existing) {
        await prisma.fieldSignal.delete({ where: { id: s.id } });
      } else {
        await prisma.fieldSignal.update({ where: { id: s.id }, data: { field: newField } });
      }
      fixed++;
    }
    if (signals.length > 0) console.log(`✅ RENAMED ${signals.length} signals: "${oldField}" → "${newField}"`);
  }

  // ─── Delete ghost field signals ───
  for (const field of SIGNAL_DELETE_FIELDS) {
    const count = await prisma.fieldSignal.count({ where: { category: 'LAPTOPS', field } });
    if (count > 0) {
      await prisma.fieldSignal.deleteMany({ where: { category: 'LAPTOPS', field } });
      console.log(`🗑️  DELETED ${count} signals for ghost field "${field}"`);
      fixed += count;
    }
  }

  // ─── Fix CategoryFieldThreshold ───
  console.log('\n=== CategoryFieldThreshold field names ===');
  const thresholds = await prisma.categoryFieldThreshold.findMany({
    where: { category: 'LAPTOPS' },
    select: { id: true, field: true, threshold: true, suggestionMargin: true }
  });

  const THRESHOLD_RENAMES = {
    'series': 'family',
    'display': 'screen',
    'screenSize': 'screen',
  };

  for (const t of thresholds) {
    const newField = THRESHOLD_RENAMES[t.field];
    if (newField) {
      await prisma.categoryFieldThreshold.update({ where: { id: t.id }, data: { field: newField } });
      console.log(`  ✅ RENAMED threshold: "${t.field}" → "${newField}"`);
      fixed++;
    } else {
      console.log(`  ✅ "${t.field}" | threshold: ${t.threshold} | margin: ${t.suggestionMargin}`);
    }
  }

  console.log(`\n🎯 Total fixes: ${fixed}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
