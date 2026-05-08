const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let fixed = 0;

  // ─── FIX 1: "נפח" wrongly points to RAM — must point to STORAGE only ───
  const nafachRam = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', phrase: 'נפח', relatedFields: { has: 'ram' } }
  });
  for (const anchor of nafachRam) {
    const newFields = anchor.relatedFields.filter(f => f !== 'ram');
    if (newFields.length === 0) newFields.push('storage');
    await prisma.fieldAnchor.update({
      where: { id: anchor.id },
      data: { relatedFields: newFields }
    });
    console.log(`✅ FIX 1: "נפח" → removed RAM, now: ${JSON.stringify(newFields)}`);
    fixed++;
  }

  // Also fix "ram: נפח" and "ddr5 נפח" that wrongly point to ram
  const nafachVariants = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['ram: נפח', 'ddr5 נפח'] },
      relatedFields: { has: 'ram' }
    }
  });
  for (const anchor of nafachVariants) {
    // These mixed anchors — ignore them (set isIgnored)
    await prisma.fieldAnchor.update({
      where: { id: anchor.id },
      data: { isIgnored: true }
    });
    console.log(`✅ FIX 1b: Ignored confusing anchor "${anchor.phrase}"`);
    fixed++;
  }

  // ─── FIX 2: "זיכרון" → ["gpu","ram"] — GPU is wrong, RAM only ───
  const zikaronGpu = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: 'זיכרון',
      relatedFields: { has: 'gpu' }
    }
  });
  for (const anchor of zikaronGpu) {
    const newFields = anchor.relatedFields.filter(f => f !== 'gpu');
    if (newFields.length === 0) newFields.push('ram');
    await prisma.fieldAnchor.update({
      where: { id: anchor.id },
      data: { relatedFields: newFields }
    });
    console.log(`✅ FIX 2: "זיכרון" → removed gpu, now: ${JSON.stringify(newFields)}`);
    fixed++;
  }

  // ─── FIX 3: "כונן" points to BOTH ram AND storage — remove from RAM ───
  const koneenRam = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['כונן', 'ram כונן', '32gb כונן'] },
      relatedFields: { has: 'ram' }
    }
  });
  for (const anchor of koneenRam) {
    const newFields = anchor.relatedFields.filter(f => f !== 'ram');
    if (newFields.length === 0) {
      await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { isIgnored: true } });
      console.log(`✅ FIX 3: Ignored "${anchor.phrase}" (had only ram, no storage)`);
    } else {
      await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { relatedFields: newFields } });
      console.log(`✅ FIX 3: "${anchor.phrase}" → removed RAM, now: ${JSON.stringify(newFields)}`);
    }
    fixed++;
  }

  // ─── FIX 4: "דיסק" / "דיסק קשיח:" point to RAM — should be storage ───
  const diskRam = await prisma.fieldAnchor.findMany({
    where: {
      category: 'LAPTOPS',
      phrase: { in: ['דיסק', 'דיסק קשיח:', 'קשיח:'] },
      relatedFields: { has: 'ram' }
    }
  });
  for (const anchor of diskRam) {
    const newFields = anchor.relatedFields.filter(f => f !== 'ram');
    if (!newFields.includes('storage')) newFields.push('storage');
    await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { relatedFields: newFields } });
    console.log(`✅ FIX 4: "${anchor.phrase}" → moved from RAM to Storage: ${JSON.stringify(newFields)}`);
    fixed++;
  }

  // ─── FIX 5: "ghz" points to RAM — should NOT ───
  const ghzRam = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', phrase: 'ghz', relatedFields: { has: 'ram' } }
  });
  for (const anchor of ghzRam) {
    const newFields = anchor.relatedFields.filter(f => f !== 'ram');
    if (newFields.length === 0) {
      await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { isIgnored: true } });
      console.log(`✅ FIX 5: Ignored "ghz" RAM anchor`);
    } else {
      await prisma.fieldAnchor.update({ where: { id: anchor.id }, data: { relatedFields: newFields } });
      console.log(`✅ FIX 5: "ghz" → removed RAM`);
    }
    fixed++;
  }

  console.log(`\n🎯 Total fixes applied: ${fixed}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
