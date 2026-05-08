const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. בדוק אם "מחשב" / "עסקי" הם anchors
  const suspiciousAnchors = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['מחשב', 'עסקי', 'עסקית', 'נייד', 'מחשב נייד', 'laptop', 'עוצמתי', 'אמין', 'מהיר'] }
    }
  });

  // 2. בדוק אם יש subModel candles שמכילים עסקי/enterprise/business
  const bizSubmodels = await prisma.fieldValueReliability.findMany({
    where: {
      category: 'LAPTOPS',
      field: 'subModel',
      value: { contains: 'עסקי' }
    }
  });
  const entSubmodels = await prisma.fieldValueReliability.findMany({
    where: {
      category: 'LAPTOPS',
      field: 'subModel',
      value: { contains: 'enterprise' }
    },
    take: 5
  });

  // 3. בדוק: האם "latitude 5440" (ללא "enterprise high") קיים כנר?
  const lat5440Direct = await prisma.fieldValueReliability.findMany({
    where: {
      category: 'LAPTOPS',
      value: { contains: 'latitude 5440' }
    }
  });

  // 4. בדוק את ה-dell brand confidence ומה ה-threshold
  const dellCandle = await prisma.fieldValueReliability.findFirst({
    where: { category: 'LAPTOPS', field: 'brand', value: 'dell' }
  });
  const brandThreshold = await prisma.categoryFieldThreshold.findFirst({
    where: { category: 'LAPTOPS', field: 'brand' }
  });

  // 5. מה הסף הגלובלי?
  const globalThresholds = await prisma.categoryFieldThreshold.findMany({
    where: { category: 'LAPTOPS' },
    orderBy: { field: 'asc' }
  });

  console.log('=== DEEP DIAGNOSTIC ===');

  console.log('\n--- Suspicious Anchors (מחשב/עסקי etc.) ---');
  if (suspiciousAnchors.length === 0) console.log('  אין — "מחשב" לא anchor');
  suspiciousAnchors.forEach(a => console.log(' ', JSON.stringify(a.phrase), '→', JSON.stringify(a.relatedFields), '| conf:', a.confidence.toFixed(3), '| ignored:', a.isIgnored));

  console.log('\n--- SubModel candles with "עסקי" ---');
  if (bizSubmodels.length === 0) console.log('  אין');
  bizSubmodels.forEach(c => console.log(' ', c.value, '| conf:', c.confidence.toFixed(3)));

  console.log('\n--- SubModel candles with "enterprise" ---');
  entSubmodels.forEach(c => console.log(' ', c.value, '| conf:', c.confidence.toFixed(3)));

  console.log('\n--- Latitude 5440 candles (all forms) ---');
  lat5440Direct.forEach(c => console.log(' ', c.field, '=', c.value, '| conf:', c.confidence.toFixed(3)));

  console.log('\n--- Dell brand status ---');
  console.log('Candle conf:', dellCandle?.confidence?.toFixed(3) || 'N/A');
  console.log('Brand threshold:', brandThreshold?.threshold || 'using global (0.85)');

  console.log('\n--- All LAPTOPS thresholds ---');
  globalThresholds.forEach(t => console.log(' ', t.field, '| threshold:', t.threshold, '| margin:', t.suggestionMargin));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
