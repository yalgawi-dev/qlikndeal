require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

let fixed = 0, deleted = 0, added = 0;

async function renameField(table, category, oldField, newField) {
  const existing = await p[table].findMany({ where: { category, field: oldField } });
  let merged = 0, renamed = 0;

  for (const row of existing) {
    // Check if canonical entry already exists (avoid duplicates)
    const dupe = await p[table].findFirst({
      where: { category, field: newField, value: row.value ?? undefined,
               rawValue: row.rawValue ?? undefined }
    });

    if (dupe) {
      // Merge: keep the higher confidence/weight, delete old
      if (table === 'fieldValueReliability') {
        const newConf = Math.max(Number(dupe.confidence), Number(row.confidence));
        const newCount = (dupe.occurrenceCount || 0) + (row.occurrenceCount || 0);
        await p[table].update({ where: { id: dupe.id }, data: { confidence: newConf, occurrenceCount: newCount } });
      } else if (table === 'fieldSignal') {
        const newWeight = Math.max(Number(dupe.weight), Number(row.weight));
        await p[table].update({ where: { id: dupe.id }, data: { weight: newWeight } });
      }
      await p[table].delete({ where: { id: row.id } });
      merged++;
    } else {
      await p[table].update({ where: { id: row.id }, data: { field: newField } });
      renamed++;
    }
  }
  const total = renamed + merged;
  if (total > 0) {
    console.log(`   ✅ ${table}: "${oldField}" → "${newField}" (${renamed} renamed, ${merged} merged)`);
    fixed += total;
  }
}

async function deleteField(table, category, field) {
  let res;
  if (table === 'fieldValueReliability') {
    res = await p.fieldValueReliability.deleteMany({ where: { category, field } });
  } else if (table === 'fieldSignal') {
    res = await p.fieldSignal.deleteMany({ where: { category, field } });
  }
  if (res?.count > 0) {
    console.log(`   🗑️  ${table}: deleted ${res.count} entries for "${field}" in ${category}`);
    deleted += res.count;
  }
}

async function fixAnchorRelatedFields(category, renames, deletions) {
  const anchors = await p.fieldAnchor.findMany({ where: { category } });
  for (const anchor of anchors) {
    let fields = anchor.relatedFields || [];
    let changed = false;

    // Rename
    fields = fields.map(f => {
      if (renames[f]) { changed = true; return renames[f]; }
      return f;
    });

    // Delete orphans
    const cleanFields = fields.filter(f => {
      if (deletions.has(f)) { changed = true; return false; }
      return true;
    });

    if (changed) {
      const uniqueFields = [...new Set(cleanFields)];
      await p.fieldAnchor.update({
        where: { id: anchor.id },
        data: { relatedFields: uniqueFields }
      });
      fixed++;
    }
  }
}

async function main() {
  console.log('=== FULL ORPHAN FIX ===\n');

  // ══════════════════════════════
  // AIO
  // ══════════════════════════════
  console.log('📁 AIO:');
  await renameField('fieldValueReliability', 'AIO', 'display',    'screen');
  await renameField('fieldValueReliability', 'AIO', 'screenSize', 'screen');
  await renameField('fieldValueReliability', 'AIO', 'series',     'family');
  await fixAnchorRelatedFields('AIO',
    { display: 'screen', screenSize: 'screen', series: 'family' },
    new Set()
  );

  // ══════════════════════════════
  // DESKTOPS
  // ══════════════════════════════
  console.log('\n📁 DESKTOPS:');
  await renameField('fieldValueReliability', 'DESKTOPS', 'series', 'family');
  await deleteField('fieldValueReliability', 'DESKTOPS', 'test_color');
  await fixAnchorRelatedFields('DESKTOPS', { series: 'family' }, new Set(['test_color']));

  // ══════════════════════════════
  // LAPTOPS
  // ══════════════════════════════
  console.log('\n📁 LAPTOPS:');
  await deleteField('fieldValueReliability', 'LAPTOPS', 'מיקום');
  await deleteField('fieldSignal',           'LAPTOPS', 'מיקום');

  // ══════════════════════════════
  // SMARTPHONES — Fix FVR
  // ══════════════════════════════
  console.log('\n📁 SMARTPHONES:');
  await renameField('fieldValueReliability', 'SMARTPHONES', 'series',      'family');
  await renameField('fieldValueReliability', 'SMARTPHONES', 'rearCamera',  'cameraMain');
  await renameField('fieldValueReliability', 'SMARTPHONES', 'frontCamera', 'cameraSystem');
  await deleteField('fieldValueReliability', 'SMARTPHONES', 'title');
  await fixAnchorRelatedFields('SMARTPHONES',
    { series: 'family', rearCamera: 'cameraMain', frontCamera: 'cameraSystem' },
    new Set(['title'])
  );

  // ══════════════════════════════
  // SMARTPHONES — Add cpu & os to CategoryFormStructure
  // ══════════════════════════════
  console.log('\n📝 SMARTPHONES FormStructure: adding cpu + os...');
  const existing = await p.categoryFormStructure.findMany({
    where: { category: 'SMARTPHONES' }, orderBy: { order: 'asc' }
  });
  const maxOrder = existing.reduce((m, r) => Math.max(m, r.order || 0), 0);

  const hasCpu = existing.some(r => r.fieldId === 'cpu');
  const hasOs  = existing.some(r => r.fieldId === 'os');

  if (!hasCpu) {
    await p.categoryFormStructure.create({
      data: {
        category:  'SMARTPHONES',
        fieldId:   'cpu',
        labelHera: 'מעבד (CPU)',
        section:   'מפרט טכני',
        fieldType: 'select',
        order:     maxOrder + 1,
        required:  false,
      }
    });
    console.log('   ✅ Added cpu to SMARTPHONES FormStructure');
    added++;
  } else {
    console.log('   ✓  cpu already exists');
  }

  if (!hasOs) {
    await p.categoryFormStructure.create({
      data: {
        category:  'SMARTPHONES',
        fieldId:   'os',
        labelHera: 'מערכת הפעלה',
        section:   'מפרט טכני',
        fieldType: 'select',
        order:     maxOrder + 2,
        required:  false,
      }
    });
    console.log('   ✅ Added os to SMARTPHONES FormStructure');
    added++;
  } else {
    console.log('   ✓  os already exists');
  }

  // ══════════════════════════════
  // CUSTOM_COMPUTERS — check series
  // ══════════════════════════════
  console.log('\n📁 CUSTOM_COMPUTERS:');
  await renameField('fieldValueReliability', 'CUSTOM_COMPUTERS', 'series', 'family');
  await fixAnchorRelatedFields('CUSTOM_COMPUTERS', { series: 'family' }, new Set());

  // ══════════════════════════════
  // Final verification
  // ══════════════════════════════
  console.log('\n\n=== FINAL VERIFICATION ===');
  const remaining = await p.fieldValueReliability.findMany({
    where: { field: { in: ['series', 'display', 'screenSize', 'test_color', 'title', 'מיקום', 'rearCamera', 'frontCamera'] } },
    select: { category: true, field: true },
    distinct: ['category', 'field']
  });

  if (remaining.length === 0) {
    console.log('✅ All FVR orphans cleared!');
  } else {
    console.log('⚠️  Still remaining:');
    remaining.forEach(r => console.log(`   ${r.category}: "${r.field}"`));
  }

  console.log(`\n🏁 Done. Fixed: ${fixed} | Deleted: ${deleted} | Added: ${added}`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
