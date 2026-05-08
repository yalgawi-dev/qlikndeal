const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.fieldValueReliability.count({ where: { category: 'LAPTOPS' } });
  const anchors = await prisma.fieldAnchor.count({ where: { category: 'LAPTOPS' } });

  const ramCandles = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS', field: 'ram' },
    orderBy: { confidence: 'desc' }, take: 15
  });
  const storageCandles = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS', field: 'storage' },
    orderBy: { confidence: 'desc' }, take: 15
  });
  const cpuCandles = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS', field: 'cpu' },
    orderBy: { confidence: 'desc' }, take: 10
  });

  // בדיקה: האם יש נרות שמגיעים מהקטלוג (formFieldOption)?
  const formOptions = await prisma.formFieldOption.count({ where: { category: 'LAPTOPS' } });

  // בדוק עוגן RAM ספציפית
  const ramAnchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', relatedFields: { has: 'ram' } },
    take: 10
  });

  console.log('=== LAPTOPS DIAGNOSTICS ===');
  console.log('Total candles (fieldValueReliability):', total);
  console.log('Total anchors (fieldAnchor):', anchors);
  console.log('Total form options (catalog mirrors):', formOptions);

  console.log('\n--- RAM candles ---');
  if (ramCandles.length === 0) console.log('  !! אין נרות RAM בכלל !!');
  ramCandles.forEach(c => console.log(' ', c.value, '| conf:', c.confidence.toFixed(3), '| occ:', c.occurrenceCount, '| ignored:', c.isIgnored));

  console.log('\n--- STORAGE candles ---');
  if (storageCandles.length === 0) console.log('  !! אין נרות Storage בכלל !!');
  storageCandles.forEach(c => console.log(' ', c.value, '| conf:', c.confidence.toFixed(3), '| occ:', c.occurrenceCount, '| ignored:', c.isIgnored));

  console.log('\n--- CPU candles ---');
  if (cpuCandles.length === 0) console.log('  !! אין נרות CPU בכלל !!');
  cpuCandles.forEach(c => console.log(' ', c.value, '| conf:', c.confidence.toFixed(3), '| occ:', c.occurrenceCount));

  console.log('\n--- RAM Anchors ---');
  if (ramAnchors.length === 0) console.log('  !! אין עוגני RAM !!');
  ramAnchors.forEach(a => console.log(' ', a.phrase, '| conf:', a.confidence, '| dir:', a.expectedDirection, '| type:', a.expectedType));

  // חשוב: בדוק אם 32gb או 1tb קיימים בנרות
  const suspicious = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS', value: { in: ['32gb', '32', '1tb', '1024gb', '1024'] } }
  });
  console.log('\n--- !! SUSPICIOUS CANDLES (32GB/1TB) !! ---');
  if (suspicious.length === 0) console.log('  אין נרות חשודים — הבעיה היא ב-Signal Engine');
  suspicious.forEach(c => console.log(' ', c.field, '=', c.value, '| conf:', c.confidence.toFixed(3), '| occ:', c.occurrenceCount, '| ignored:', c.isIgnored));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
