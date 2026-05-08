require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('=== DEEP ORPHAN FIELD AUDIT ===\n');

  // 1. Get all valid fieldIds per category from CategoryFormStructure
  const formStructure = await p.categoryFormStructure.findMany({
    select: { category: true, fieldId: true }
  });

  const validFields = {}; // { LAPTOPS: Set(['brand','family',...]), ... }
  for (const row of formStructure) {
    if (!validFields[row.category]) validFields[row.category] = new Set();
    validFields[row.category].add(row.fieldId);
  }

  const categories = Object.keys(validFields).sort();
  console.log(`Categories in FormStructure: ${categories.join(', ')}\n`);

  // 2. Check FVR orphans per category
  console.log('══════════════════════════════════════');
  console.log('📚 FieldValueReliability (AI Dictionary)');
  console.log('══════════════════════════════════════');

  const fvrAll = await p.fieldValueReliability.groupBy({
    by: ['category', 'field'],
    _count: { id: true },
    orderBy: [{ category: 'asc' }, { field: 'asc' }]
  });

  const fvrOrphans = [];
  for (const cat of categories) {
    const rows = fvrAll.filter(r => r.category === cat);
    const valid = validFields[cat];
    const orphans = rows.filter(r => !valid.has(r.field));
    const ok = rows.filter(r => valid.has(r.field));

    console.log(`\n📁 ${cat}:`);
    for (const r of ok) console.log(`   ✅ ${r.field.padEnd(20)} (${r._count.id} entries)`);
    for (const r of orphans) {
      console.log(`   🔴 ${r.field.padEnd(20)} (${r._count.id} entries) ← ORPHAN`);
      fvrOrphans.push({ category: cat, field: r.field, count: r._count.id, table: 'FVR' });
    }
  }

  // Check FVR entries in categories not in FormStructure
  const unknownCats = [...new Set(fvrAll.map(r => r.category))].filter(c => !validFields[c]);
  if (unknownCats.length > 0) {
    console.log(`\n⚠️  FVR has entries for UNKNOWN categories: ${unknownCats.join(', ')}`);
  }

  // 3. Check FieldSignal orphans
  console.log('\n\n══════════════════════════════════════');
  console.log('📡 FieldSignal (Direct Signals)');
  console.log('══════════════════════════════════════');

  const signalAll = await p.fieldSignal.groupBy({
    by: ['category', 'field'],
    _count: { id: true },
    orderBy: [{ category: 'asc' }, { field: 'asc' }]
  });

  const signalOrphans = [];
  for (const cat of categories) {
    const rows = signalAll.filter(r => r.category === cat);
    if (rows.length === 0) continue;
    const valid = validFields[cat];
    const orphans = rows.filter(r => !valid.has(r.field));

    if (orphans.length > 0) {
      console.log(`\n📁 ${cat}:`);
      for (const r of rows.filter(r => valid.has(r.field)))
        console.log(`   ✅ ${r.field.padEnd(20)} (${r._count.id})`);
      for (const r of orphans) {
        console.log(`   🔴 ${r.field.padEnd(20)} (${r._count.id}) ← ORPHAN`);
        signalOrphans.push({ category: cat, field: r.field, count: r._count.id, table: 'Signal' });
      }
    } else {
      console.log(`\n✅ ${cat}: all ${rows.length} signal fields valid`);
    }
  }

  // 4. Check FieldAnchor orphans (relatedFields array)
  console.log('\n\n══════════════════════════════════════');
  console.log('⚓ FieldAnchor (relatedFields)');
  console.log('══════════════════════════════════════');

  for (const cat of categories) {
    const anchors = await p.fieldAnchor.findMany({
      where: { category: cat, isIgnored: false },
      select: { phrase: true, relatedFields: true }
    });
    if (anchors.length === 0) continue;

    const valid = validFields[cat];
    const orphanAnchorFields = new Set();
    for (const a of anchors) {
      for (const f of a.relatedFields) {
        if (!valid.has(f)) orphanAnchorFields.add(f);
      }
    }

    if (orphanAnchorFields.size > 0) {
      console.log(`\n🔴 ${cat}: orphan relatedFields: [${[...orphanAnchorFields].join(', ')}]`);
    } else {
      console.log(`✅ ${cat}: all anchor relatedFields valid`);
    }
  }

  // 5. Summary + Fix recommendations
  const allOrphans = [...fvrOrphans, ...signalOrphans];
  console.log('\n\n══════════════════════════════════════');
  console.log('📋 SUMMARY');
  console.log('══════════════════════════════════════');
  console.log(`Total orphan field types: ${allOrphans.length}`);

  if (allOrphans.length > 0) {
    console.log('\nOrphans to fix:');
    for (const o of allOrphans) {
      console.log(`  ${o.table} | ${o.category} | "${o.field}" (${o.count} entries)`);
    }
    console.log('\nRecommended action: Run purge or rename for each orphan above.');
  } else {
    console.log('✅ No orphans found!');
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
