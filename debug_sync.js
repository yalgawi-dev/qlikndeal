const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // מה שמות השדות בDB vs מה שהפורם מצפה לקבל
  const fvrFields = await prisma.fieldValueReliability.groupBy({
    by: ['field'],
    where: { category: 'LAPTOPS' },
    _count: { id: true }
  });

  const formFields = await prisma.formFieldOption.groupBy({
    by: ['fieldId'],
    where: { category: 'LAPTOPS' },
    _count: { id: true }
  });

  const anchorFields = await prisma.fieldAnchor.groupBy({
    by: ['relatedFields'],
    where: { category: 'LAPTOPS', isIgnored: false },
    _count: { id: true }
  });

  console.log('=== FIELD NAME SYNC CHECK ===');
  console.log('\n--- FVR (candles) field names ---');
  fvrFields.forEach(f => console.log(' ', f.field, ':', f._count.id));

  console.log('\n--- FormFieldOption fieldId names ---');
  formFields.forEach(f => console.log(' ', f.fieldId, ':', f._count.id));

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
