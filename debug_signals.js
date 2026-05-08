const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // בדוק fieldSignal — "gb" ו-"nvme" ו-"ssd"
  const gbSignals = await prisma.fieldSignal.findMany({
    where: { category: 'LAPTOPS', rawValue: { in: ['gb', 'tb', 'nvme', 'ssd', 'ddr5', 'ddr4'] } }
  });

  // בדוק את העוגן "נפח" — מה השדות שהוא מצביע עליהם
  const nafachAnchor = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', phrase: { contains: 'נפח' } }
  });

  // בדוק עוגנים שמצביעים על RAM
  const ramAnchorsAll = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', relatedFields: { has: 'ram' } }
  });

  // בדוק עוגנים שמצביעים על storage
  const storageAnchorsAll = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', relatedFields: { has: 'storage' } }
  });

  // בדוק האם יש עוגן "זיכרון" ו-"ram" לשדה RAM
  const memAnchors = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['זיכרון', 'ram', 'memory', 'זיכרון ram', 'זכרון', 'זיכרון (ram)'] }
    }
  });

  console.log('=== SIGNAL ENGINE DIAGNOSTICS ===');
  console.log('\n--- GB/TB/NVMe FieldSignals ---');
  if (gbSignals.length === 0) console.log('  !! אין Unit Signals בכלל לGB/TB !!');
  gbSignals.forEach(s => console.log(' ', s.rawValue, '→ field:', s.field, '| weight:', s.weight, '| type:', s.signalType));

  console.log('\n--- Anchors containing "נפח" ---');
  nafachAnchor.forEach(a => console.log(' ', JSON.stringify(a.phrase), '→ relatedFields:', JSON.stringify(a.relatedFields), '| conf:', a.confidence, '| dir:', a.expectedDirection));

  console.log('\n--- ALL RAM Anchors (relatedFields has ram) ---');
  console.log('Count:', ramAnchorsAll.length);
  ramAnchorsAll.forEach(a => console.log(' ', JSON.stringify(a.phrase), '| dir:', a.expectedDirection, '| type:', a.expectedType, '| conf:', a.confidence.toFixed(3)));

  console.log('\n--- ALL Storage Anchors (relatedFields has storage) ---');
  console.log('Count:', storageAnchorsAll.length);
  storageAnchorsAll.forEach(a => console.log(' ', JSON.stringify(a.phrase), '| dir:', a.expectedDirection, '| type:', a.expectedType, '| conf:', a.confidence.toFixed(3)));

  console.log('\n--- Memory/RAM specific anchors ---');
  memAnchors.forEach(a => console.log(' ', JSON.stringify(a.phrase), '| relatedFields:', JSON.stringify(a.relatedFields), '| dir:', a.expectedDirection));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
