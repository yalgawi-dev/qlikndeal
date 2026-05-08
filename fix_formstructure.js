require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('=== Adding cpu + os to SMARTPHONES FormStructure ===\n');

  const existing = await p.categoryFormStructure.findMany({
    where: { category: 'SMARTPHONES' },
    orderBy: { order: 'asc' }
  });

  console.log('Current SMARTPHONES fields:', existing.map(r => `${r.fieldId}(${r.order})`).join(', '));

  const maxOrder = existing.reduce((m, r) => Math.max(m, r.order || 0), 0);
  const hasCpu = existing.some(r => r.fieldId === 'cpu');
  const hasOs  = existing.some(r => r.fieldId === 'os');

  if (!hasCpu) {
    await p.categoryFormStructure.create({
      data: {
        category:    'SMARTPHONES',
        fieldId:     'cpu',
        labelHera:   'מעבד (CPU)',
        sectionName: 'מפרט טכני',
        fieldType:   'select',
        order:       maxOrder + 1,
        isRequired:  false,
        isDynamic:   false,
        icon:        'Cpu',
        colSpan:     1,
      }
    });
    console.log('✅ Added cpu');
  } else {
    console.log('✓  cpu already exists');
  }

  if (!hasOs) {
    await p.categoryFormStructure.create({
      data: {
        category:    'SMARTPHONES',
        fieldId:     'os',
        labelHera:   'מערכת הפעלה',
        sectionName: 'מפרט טכני',
        fieldType:   'select',
        order:       maxOrder + 2,
        isRequired:  false,
        isDynamic:   false,
        icon:        'Monitor',
        colSpan:     1,
      }
    });
    console.log('✅ Added os');
  } else {
    console.log('✓  os already exists');
  }

  // Also fix LAPTOPS "מיקום" orphan (was skipped in prev run due to encoding)
  const locFvr = await p.fieldValueReliability.deleteMany({
    where: { category: 'LAPTOPS', field: { contains: 'מיקום' } }
  });
  const locSig = await p.fieldSignal.deleteMany({
    where: { category: 'LAPTOPS', field: { contains: 'מיקום' } }
  });
  if (locFvr.count + locSig.count > 0) {
    console.log(`\n🗑️  Deleted "מיקום" orphan: ${locFvr.count} FVR + ${locSig.count} Signal entries`);
  }

  // Final verification
  console.log('\n=== FINAL VERIFICATION ===');
  const smartphones = await p.categoryFormStructure.findMany({
    where: { category: 'SMARTPHONES' },
    orderBy: { order: 'asc' },
    select: { fieldId: true, order: true }
  });
  console.log('SMARTPHONES fields now:', smartphones.map(r => r.fieldId).join(', '));

  const remainingOrphans = await p.fieldValueReliability.findMany({
    where: { field: { in: ['series','display','screenSize','test_color','title','rearCamera','frontCamera'] } },
    select: { category: true, field: true },
    distinct: ['category', 'field']
  });
  if (remainingOrphans.length === 0) {
    console.log('✅ All FVR orphans cleared!');
  } else {
    console.log('⚠️  Remaining:', remainingOrphans.map(r => `${r.category}:${r.field}`).join(', '));
  }

  await p.$disconnect();
  console.log('\n🏁 Done.');
}
main().catch(e => { console.error(e); process.exit(1); });
