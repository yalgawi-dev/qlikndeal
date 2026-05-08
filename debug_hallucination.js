const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. האם "עסקית" / "עסקי" / "enterprise" קיים כנר בDB?
  const suspicious = await prisma.fieldValueReliability.findMany({
    where: {
      category: 'LAPTOPS',
      value: { in: ['עסקי', 'עסקית', 'enterprise', 'enterprise high', 'business'] }
    }
  });

  // 2. האם יש נרות ל-Latitude / Latitude 5440 / Dell?
  const modelCandles = await prisma.fieldValueReliability.findMany({
    where: {
      category: 'LAPTOPS',
      value: { in: ['latitude', 'latitude 5440', 'dell', 'latitude 5440 enterprise high'] }
    }
  });

  // 3. האם "דגם יצרן" ו"סדרת יצרן" קיימים כ-Anchors ב-LAPTOPS?
  const labelAnchors = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['דגם יצרן', 'דגם', 'סדרת יצרן', 'סדרה', 'יצרן', 'מדגם', 'model', 'series', 'brand', 'יצרן:'] }
    }
  });

  // 4. האם יש subModel / series candles?
  const subModelCandles = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS', field: { in: ['subModel', 'series', 'brand'] } },
    orderBy: { confidence: 'desc' },
    take: 20
  });

  // 5. האם "עסקי" / "עסקית" קיים כ-Anchor?
  const bizAnchor = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', phrase: { in: ['עסקי', 'עסקית', 'עסקיים', 'business'] } }
  });

  // 6. כמות נרות לפי שדה
  const byField = await prisma.fieldValueReliability.groupBy({
    by: ['field'],
    where: { category: 'LAPTOPS' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  console.log('=== DIAGNOSTIC: HALLUCINATION SOURCE ===');
  console.log('\n--- Suspicious candles (עסקי/enterprise) ---');
  if (suspicious.length === 0) console.log('  אין — לא זה הגורם');
  suspicious.forEach(c => console.log(' ', c.field, '=', c.value, '| conf:', c.confidence.toFixed(3)));

  console.log('\n--- Model/Brand candles ---');
  if (modelCandles.length === 0) console.log('  !! אין נרות ל-Latitude/Dell — זו הסיבה שהמערכת לא מזהה את הדגם!');
  modelCandles.forEach(c => console.log(' ', c.field, '=', c.value, '| conf:', c.confidence.toFixed(3)));

  console.log('\n--- Label Anchors (דגם/סדרה/יצרן) ---');
  if (labelAnchors.length === 0) console.log('  !! אין עוגני שם שדה — המערכת לא מבינה שאחרי "דגם יצרן:" בא הדגם!');
  labelAnchors.forEach(a => console.log(' ', JSON.stringify(a.phrase), '→', JSON.stringify(a.relatedFields), '| dir:', a.expectedDirection, '| conf:', a.confidence.toFixed(3)));

  console.log('\n--- subModel/series/brand candles (top 20) ---');
  subModelCandles.forEach(c => console.log(' ', c.field, '=', c.value, '| conf:', c.confidence.toFixed(3), '| occ:', c.occurrenceCount));

  console.log('\n--- "עסקי" anchors ---');
  bizAnchor.forEach(a => console.log(' ', a.phrase, '→', JSON.stringify(a.relatedFields), '| conf:', a.confidence.toFixed(3)));

  console.log('\n--- Candle count by field ---');
  byField.forEach(b => console.log(' ', b.field, ':', b._count.id));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
