const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = 'LAPTOPS';
  
  // CPU generic candles
  const cpuCandles = [
    { value: 'intel core i5', confidence: 0.88 },
    { value: 'intel core i7', confidence: 0.88 },
    { value: 'intel core i9', confidence: 0.88 },
    { value: 'intel core i3', confidence: 0.85 },
    { value: 'amd ryzen 5', confidence: 0.88 },
    { value: 'amd ryzen 7', confidence: 0.88 },
    { value: 'amd ryzen 9', confidence: 0.88 },
    { value: 'apple m1', confidence: 0.90 },
    { value: 'apple m2', confidence: 0.90 },
    { value: 'apple m3', confidence: 0.90 },
    { value: 'apple m4', confidence: 0.90 },
  ];
  
  // Screen generic candles
  const screenCandles = [
    { value: '14"', confidence: 0.85 },
    { value: '15.6"', confidence: 0.85 },
    { value: '13.3"', confidence: 0.85 },
    { value: '16"', confidence: 0.85 },
    { value: '14 אינץ', confidence: 0.85 },
    { value: '15 אינץ', confidence: 0.85 },
    { value: '13 אינץ', confidence: 0.85 },
    { value: '14 full hd', confidence: 0.88 },
    { value: '15.6 full hd', confidence: 0.88 },
    { value: 'full hd anti-glare', confidence: 0.80 },
  ];
  
  let added = 0;
  
  for (const c of cpuCandles) {
    await prisma.fieldValueReliability.upsert({
      where: { value_field_category: { category, field: 'cpu', value: c.value } },
      update: { confidence: c.confidence },
      create: { category, field: 'cpu', value: c.value, confidence: c.confidence, occurrenceCount: 1 }
    });
    added++;
  }
  console.log(`✅ Added ${cpuCandles.length} CPU generic candles`);
  
  for (const c of screenCandles) {
    await prisma.fieldValueReliability.upsert({
      where: { value_field_category: { category, field: 'screen', value: c.value } },
      update: { confidence: c.confidence },
      create: { category, field: 'screen', value: c.value, confidence: c.confidence, occurrenceCount: 1 }
    });
    added++;
  }
  console.log(`✅ Added ${screenCandles.length} Screen generic candles`);
  
  console.log(`\n🎯 Total added: ${added}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
