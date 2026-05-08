const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const fields = await prisma.categoryFormStructure.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }]
  });

  const categories = {};
  fields.forEach(f => {
    if (!categories[f.category]) categories[f.category] = [];
    categories[f.category].push(`${f.sectionName} | ${f.fieldId} (${f.labelHera}) [${f.fieldType}]`);
  });

  for (const [cat, fieldsList] of Object.entries(categories)) {
    console.log(`\n=== CATEGORY: ${cat} ===`);
    fieldsList.forEach(item => console.log(item));
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
