const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // שדות שנשארים ב-FVR בכוונה ללא שדה בפורם (future features)
  const KNOWN_EXCEPTIONS = new Set(['מיקום ', 'מיקום']);

  // כל שמות השדות במילון (FVR)
  const fvrFields = await prisma.fieldValueReliability.groupBy({
    by: ['field'],
    where: { category: 'LAPTOPS' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // כל שמות השדות בפורם
  const formFields = await prisma.categoryFormStructure.findMany({
    where: { category: 'LAPTOPS' },
    select: { fieldId: true, labelHera: true }
  });
  const formFieldIds = new Set(formFields.map(f => f.fieldId));

  // כל שמות השדות ב-FormFieldOption
  const optionFields = await prisma.formFieldOption.groupBy({
    by: ['fieldId'],
    where: { category: 'LAPTOPS' },
    _count: { id: true }
  });
  const optionFieldIds = new Set(optionFields.map(f => f.fieldId));

  // כל שמות השדות בעוגנים (fieldAnchor)
  const allAnchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', isIgnored: false },
    select: { relatedFields: true }
  });
  const anchorFieldNames = new Set(allAnchors.flatMap(a => a.relatedFields));

  console.log('=== FULL FIELD SYNC AUDIT ===\n');
  console.log('Form fieldIds:', [...formFieldIds].join(', '));
  console.log('');

  console.log('--- FVR (נרות) fields vs Form ---');
  let hasOrphans = false;
  fvrFields.forEach(f => {
    if (KNOWN_EXCEPTIONS.has(f.field)) {
      console.log(`  ⏸️  KNOWN EXCEPTION "${f.field}" | ${f._count.id} נרות | (future: user profile field)`);
      return;
    }
    const inForm = formFieldIds.has(f.field);
    const inOptions = optionFieldIds.has(f.field);
    const status = inForm ? '✅' : '❌ ORPHAN';
    console.log(`  ${status} "${f.field}" | ${f._count.id} נרות | form: ${inForm} | options: ${inOptions}`);
    if (!inForm) hasOrphans = true;
  });

  console.log('\n--- Form fields NOT in FVR (שדות ללא נרות) ---');
  formFields.forEach(f => {
    const hasFvr = fvrFields.some(fvr => fvr.field === f.fieldId);
    if (!hasFvr) {
      console.log(`  ⚠️  "${f.fieldId}" (${f.labelHera}) — אין נרות!`);
    }
  });

  console.log('\n--- Anchor relatedFields vs Form ---');
  const orphanAnchorFields = [...anchorFieldNames].filter(f => f && !formFieldIds.has(f));
  if (orphanAnchorFields.length === 0) {
    console.log('  ✅ כל שדות העוגנים מופיעים בפורם');
  } else {
    orphanAnchorFields.forEach(f => console.log(`  ❌ ORPHAN ANCHOR FIELD: "${f}"`));
  }

  if (!hasOrphans) {
    console.log('\n✅ כל שדות ה-FVR מסונכרנים עם הפורם!');
  } else {
    console.log('\n❌ יש שדות לא מסונכרנים — נדרש תיקון!');
  }

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
