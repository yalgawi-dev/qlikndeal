const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FORM_FIELDS = new Set([
  'os', 'family', 'condition', 'subModel', 'ram', 'storage',
  'gpu', 'screen', 'brand', 'cpu', 'batteryHealth',
  'screenType', 'releaseYear', 'type', 'sku'
]);
const KNOWN_EXCEPTIONS = new Set(['מיקום ', 'מיקום', 'price', 'condition', 'title', 'description']);

async function checkField(tableName, items, getField) {
  let orphans = 0;
  items.forEach(item => {
    const f = getField(item);
    if (!f) return;
    const fields = Array.isArray(f) ? f : [f];
    fields.forEach(field => {
      if (field && !FORM_FIELDS.has(field) && !KNOWN_EXCEPTIONS.has(field)) {
        console.log(`  ❌ [${tableName}] field "${field}"`);
        orphans++;
      }
    });
  });
  if (orphans === 0) console.log(`  ✅ ${tableName} — all clean`);
  return orphans;
}

async function main() {
  let total = 0;

  // ─── WeightAuditLog ───
  console.log('\n=== WeightAuditLog ===');
  try {
    const logs = await prisma.weightAuditLog.findMany({
      where: { category: 'LAPTOPS' },
      select: { fieldId: true }
    });
    total += await checkField('WeightAuditLog', logs, l => l.fieldId);
  } catch (e) { console.log('  ⚠️ Error or empty:', e.message.split('\n')[0]); }

  // ─── ThresholdLog ───
  console.log('\n=== ThresholdLog ===');
  try {
    const logs = await prisma.thresholdLog.findMany({
      where: { category: 'LAPTOPS' },
      select: { field: true }
    });
    total += await checkField('ThresholdLog', logs, l => l.field);
  } catch (e) { console.log('  ⚠️ Error or empty:', e.message.split('\n')[0]); }

  // ─── UserCorrection ───
  console.log('\n=== UserCorrection ===');
  try {
    const corrections = await prisma.userCorrection.findMany({
      where: { category: 'LAPTOPS' },
      select: { field: true }
    });
    total += await checkField('UserCorrection', corrections, c => c.field);
  } catch (e) { console.log('  ⚠️ Error or empty:', e.message.split('\n')[0]); }

  // ─── CategoryLearningMarker ───
  console.log('\n=== CategoryLearningMarker ===');
  try {
    const markers = await prisma.categoryLearningMarker.findMany({
      where: { category: 'LAPTOPS' },
      select: { lastLearnedField: true }
    });
    total += await checkField('CategoryLearningMarker', markers, m => m.lastLearnedField);
  } catch (e) { console.log('  ⚠️ Error or empty:', e.message.split('\n')[0]); }

  // ─── ParserLog (has fieldData JSON) ───
  console.log('\n=== ParserLog (field names in JSON) ===');
  try {
    const logs = await prisma.parserLog.findMany({
      where: { category: 'LAPTOPS' },
      select: { fieldData: true },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });
    const fieldNamesInLogs = new Set();
    logs.forEach(l => {
      if (l.fieldData && typeof l.fieldData === 'object') {
        Object.keys(l.fieldData).forEach(k => fieldNamesInLogs.add(k));
      }
    });
    let orphans = 0;
    fieldNamesInLogs.forEach(f => {
      if (!FORM_FIELDS.has(f) && !KNOWN_EXCEPTIONS.has(f)) {
        console.log(`  ❌ ParserLog JSON field "${f}"`);
        orphans++;
      }
    });
    if (orphans === 0) console.log(`  ✅ ParserLog JSON fields — all clean`);
    total += orphans;
  } catch (e) { console.log('  ⚠️ Error:', e.message.split('\n')[0]); }

  console.log(`\n🎯 Total remaining orphans: ${total}`);
  if (total === 0) console.log('✅ ALL TABLES FULLY SYNCHRONIZED!');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
