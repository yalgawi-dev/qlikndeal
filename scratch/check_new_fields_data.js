const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fvr = await prisma.fieldValueReliability.findMany({
    where: {
      category: 'LAPTOPS',
      field: { in: ['refreshRate', 'resolutionType', 'extraStorage'] }
    }
  });
  console.log('FieldValueReliability matches:', fvr);

  const ffo = await prisma.formFieldOption.findMany({
    where: {
      category: 'LAPTOPS',
      fieldId: { in: ['refreshRate', 'resolutionType', 'extraStorage'] }
    }
  });
  console.log('FormFieldOption matches:', ffo);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
