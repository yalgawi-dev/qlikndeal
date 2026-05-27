const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fields = await prisma.categoryFormStructure.findMany({
    where: { category: 'LAPTOPS' },
    orderBy: { order: 'asc' }
  });
  console.log(JSON.stringify(fields.map(f => ({
    fieldId: f.fieldId,
    labelHera: f.labelHera,
    fieldType: f.fieldType,
    sectionName: f.sectionName,
    order: f.order
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
