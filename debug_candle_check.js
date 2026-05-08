const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // בדוק דוגמאות ספציפיות שידענו שהיו שגויות
  const checks = [
    { value: 'latitude',        expectedField: 'family' },
    { value: 'latitude 5440',   expectedField: 'subModel' },
    { value: 'dell',            expectedField: 'brand' },
    { value: 'macbook pro',     expectedField: 'subModel' },
    { value: 'windows 11 pro',  expectedField: 'os' },
    { value: '16gb ddr5',       expectedField: 'ram' },
    { value: '512gb nvme',      expectedField: 'storage' },
    { value: 'ideapad',         expectedField: 'family' },
    { value: 'thinkpad',        expectedField: 'family' },
    { value: 'intel core i5',   expectedField: 'cpu' },
  ];

  console.log('=== CANDLE-FIELD ASSOCIATION CHECK ===\n');

  for (const check of checks) {
    const candle = await prisma.fieldValueReliability.findFirst({
      where: { category: 'LAPTOPS', value: { contains: check.value } },
      orderBy: { confidence: 'desc' }
    });
    if (!candle) {
      console.log(`  ⚠️  "${check.value}" — NOT FOUND in FVR`);
    } else if (candle.field === check.expectedField) {
      console.log(`  ✅ "${candle.value}" → field: "${candle.field}" (conf: ${candle.confidence.toFixed(3)})`);
    } else {
      console.log(`  ❌ "${candle.value}" → field: "${candle.field}" (expected: "${check.expectedField}") conf: ${candle.confidence.toFixed(3)}`);
    }
  }

  console.log('\n=== ALL FAMILY (series) CANDLES ===');
  const familyCandles = await prisma.fieldValueReliability.findMany({
    where: { category: 'LAPTOPS', field: 'family' },
    orderBy: { confidence: 'desc' },
    take: 10
  });
  familyCandles.forEach(c => console.log(`  "${c.value}" | conf: ${c.confidence.toFixed(3)}`));

  console.log('\n=== CHECKING: any "series" candles still exist? ===');
  const seriesCandles = await prisma.fieldValueReliability.count({ where: { category: 'LAPTOPS', field: 'series' } });
  console.log(seriesCandles === 0 ? '  ✅ Zero "series" candles — all migrated to "family"' : `  ❌ ${seriesCandles} "series" candles still exist!`);

  console.log('\n=== CHECKING: any old field names in FVR? ===');
  const oldFields = ['series', 'display', 'screenSize', 'title', 'BatteryStatus', 'SKU', 'שנת דגם', 'טכנולוגיית מסך '];
  for (const f of oldFields) {
    const count = await prisma.fieldValueReliability.count({ where: { category: 'LAPTOPS', field: f } });
    if (count > 0) console.log(`  ❌ Old field "${f}" still has ${count} candles!`);
    else console.log(`  ✅ "${f}" — clean`);
  }

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
