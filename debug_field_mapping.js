const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const formFields = await prisma.categoryFormStructure.findMany({
    where: { category: 'LAPTOPS' },
    orderBy: { order: 'asc' },
    select: { fieldId: true, labelHera: true, fieldType: true, sectionName: true }
  });

  const aiFieldNames = ['series', 'subModel', 'brand', 'ram', 'storage', 'cpu', 'os', 'screen', 'screenSize', 'gpu', 'condition', 'display', 'title'];
  const formFieldIds = formFields.map(f => f.fieldId);

  console.log('=== FORM FIELD IDs (CategoryFormStructure) ===');
  formFields.forEach(f => console.log(`  "${f.fieldId}" | label: "${f.labelHera}" | type: ${f.fieldType}`));

  console.log('\n=== SYNC CHECK: AI field names vs Form fieldIds ===');
  aiFieldNames.forEach(aiField => {
    const match = formFieldIds.includes(aiField);
    console.log(`  AI "${aiField}" → Form: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
  });

  console.log('\n=== Form fields NOT in AI field names ===');
  formFieldIds.forEach(fid => {
    if (!aiFieldNames.includes(fid)) {
      const field = formFields.find(f => f.fieldId === fid);
      console.log(`  Form "${fid}" | label: "${field?.labelHera}"`);
    }
  });

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
