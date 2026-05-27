const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const countOptions = await prisma.formFieldOption.count({
    where: { fieldId: 'display' }
  });
  const countFVR = await prisma.fieldValueReliability.count({
    where: { field: 'display' }
  });
  console.log(`Current display options in DB: FormFieldOption = ${countOptions}, FieldValueReliability = ${countFVR}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
