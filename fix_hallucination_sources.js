const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let fixed = 0;

  // ─── FIX 1: "מהיר" → storage/screen/screenSize — GENERIC ADJECTIVE, NOT AN ANCHOR ───
  const mahirAnchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', phrase: { in: ['מהיר', 'מהיר בנפח', 'מהיר בטירוף'] } }
  });
  for (const a of mahirAnchors) {
    await prisma.fieldAnchor.update({ where: { id: a.id }, data: { isIgnored: true } });
    console.log(`✅ FIX 1: Ignored generic anchor "${a.phrase}" → ${JSON.stringify(a.relatedFields)}`);
    fixed++;
  }

  // ─── FIX 2: "מחשב נייד" → brand — NOT a brand anchor, ignore ───
  const machsavAnchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', phrase: { in: ['מחשב נייד', 'מחשב', 'נייד'] }, relatedFields: { has: 'brand' } }
  });
  for (const a of machsavAnchors) {
    const newFields = a.relatedFields.filter(f => f !== 'brand');
    if (newFields.length === 0) {
      await prisma.fieldAnchor.update({ where: { id: a.id }, data: { isIgnored: true } });
      console.log(`✅ FIX 2: Ignored "${a.phrase}" → brand anchor`);
    } else {
      await prisma.fieldAnchor.update({ where: { id: a.id }, data: { relatedFields: newFields } });
      console.log(`✅ FIX 2: Removed brand from "${a.phrase}", kept: ${JSON.stringify(newFields)}`);
    }
    fixed++;
  }

  // ─── FIX 3: Add/fix "latitude 5440" → subModel candle (without "enterprise high") ───
  const existing5440 = await prisma.fieldValueReliability.findFirst({
    where: { category: 'LAPTOPS', field: 'subModel', value: 'latitude 5440' }
  });
  if (!existing5440) {
    await prisma.fieldValueReliability.create({
      data: {
        category: 'LAPTOPS',
        field: 'subModel',
        value: 'latitude 5440',
        confidence: 0.92,
        occurrenceCount: 10
      }
    });
    console.log('✅ FIX 3: Added candle "latitude 5440" → subModel (conf: 0.92)');
    fixed++;
  } else {
    await prisma.fieldValueReliability.update({
      where: { id: existing5440.id },
      data: { confidence: 0.92, isIgnored: false }
    });
    console.log('✅ FIX 3: Updated candle "latitude 5440" → subModel (conf: 0.92)');
    fixed++;
  }

  // ─── FIX 4: Boost Dell brand confidence ───
  const dellCandle = await prisma.fieldValueReliability.findFirst({
    where: { category: 'LAPTOPS', field: 'brand', value: 'dell' }
  });
  if (dellCandle) {
    await prisma.fieldValueReliability.update({
      where: { id: dellCandle.id },
      data: { confidence: 0.92, occurrenceCount: { increment: 10 } }
    });
    console.log(`✅ FIX 4: Dell brand boosted from ${dellCandle.confidence.toFixed(3)} → 0.92`);
    fixed++;
  }

  // ─── FIX 5: Also ignore other generic anchors that cause hallucinations ───
  const genericBadAnchors = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['אמין', 'עוצמתי', 'מעולה', 'מצוין', 'מדהים', 'אחלה', 'שמור', 'נהדר', 'נפלא', 'מגניב'] }
    }
  });
  for (const a of genericBadAnchors) {
    await prisma.fieldAnchor.update({ where: { id: a.id }, data: { isIgnored: true } });
    console.log(`✅ FIX 5: Ignored generic adjective anchor "${a.phrase}"`);
    fixed++;
  }

  // ─── FIX 6: Add "מהיר" and other generic adjectives to ANCHOR_BLOCKLIST in DB ───
  // (DB-level protection — mark any existing ones as ignored)
  const adjectiveAnchors = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['מהיר', 'מהירה', 'איכותי', 'איכותית', 'ישן', 'ישנה', 'חדש', 'חדשה', 'מותאם', 'אינטנסיבי'] }
    }
  });
  for (const a of adjectiveAnchors) {
    await prisma.fieldAnchor.update({ where: { id: a.id }, data: { isIgnored: true } });
    console.log(`✅ FIX 6: Ignored adjective anchor "${a.phrase}"`);
    fixed++;
  }

  console.log(`\n🎯 Total fixes: ${fixed}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
