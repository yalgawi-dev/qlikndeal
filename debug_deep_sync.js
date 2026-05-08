const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const FORM_FIELDS = new Set([
    'os', 'family', 'condition', 'subModel', 'ram', 'storage',
    'gpu', 'screen', 'brand', 'cpu', 'batteryHealth',
    'screenType', 'releaseYear', 'type', 'sku', 'price', 'מיקום'
  ]);
  const KNOWN_EXCEPTIONS = new Set(['מיקום ', 'מיקום', 'price', 'title']);

  // ─── 1. FieldAnchor relatedFields audit ───
  console.log('=== 1. FIELD ANCHOR relatedFields ===');
  const anchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', isIgnored: false },
    select: { phrase: true, relatedFields: true, confidence: true }
  });
  let anchorOrphans = 0;
  const orphanAnchorFields = new Set();
  anchors.forEach(a => {
    a.relatedFields.forEach(f => {
      if (!FORM_FIELDS.has(f) && !KNOWN_EXCEPTIONS.has(f)) {
        console.log(`  ❌ Anchor "${a.phrase}" → field "${f}" NOT in form`);
        orphanAnchorFields.add(f);
        anchorOrphans++;
      }
    });
  });
  if (anchorOrphans === 0) console.log('  ✅ All anchor relatedFields are canonical');
  else console.log(`  Total: ${anchorOrphans} orphan anchor field references`);

  // ─── 2. FieldSignal field audit ───
  console.log('\n=== 2. FIELD SIGNAL field names ===');
  const signalFields = await prisma.fieldSignal.groupBy({
    by: ['field'],
    where: { category: 'LAPTOPS' },
    _count: { id: true }
  });
  let signalOrphans = 0;
  signalFields.forEach(s => {
    if (!FORM_FIELDS.has(s.field) && !KNOWN_EXCEPTIONS.has(s.field)) {
      console.log(`  ❌ FieldSignal field "${s.field}" NOT in form | ${s._count.id} signals`);
      signalOrphans++;
    } else {
      console.log(`  ✅ "${s.field}" | ${s._count.id} signals`);
    }
  });
  if (signalOrphans === 0) console.log('  ✅ All FieldSignal fields are canonical');

  // ─── 3. CategoryFieldThreshold field audit ───
  console.log('\n=== 3. CategoryFieldThreshold field names ===');
  const thresholds = await prisma.categoryFieldThreshold.findMany({
    where: { category: 'LAPTOPS' },
    select: { field: true, threshold: true, suggestionMargin: true }
  });
  thresholds.forEach(t => {
    const ok = FORM_FIELDS.has(t.field) || KNOWN_EXCEPTIONS.has(t.field);
    console.log(`  ${ok ? '✅' : '❌'} "${t.field}" | threshold: ${t.threshold} | margin: ${t.suggestionMargin}`);
  });

  console.log('\n🎯 Audit complete');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
