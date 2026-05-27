const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fields = await prisma.categoryFormStructure.findMany({
    where: { category: 'CUSTOM_COMPUTERS' },
    orderBy: { order: 'asc' }
  });
  console.log("CUSTOM_COMPUTERS fields:");
  console.log(JSON.stringify(fields, null, 2));

  const options = await prisma.formFieldOption.findMany({
    where: { category: 'CUSTOM_COMPUTERS' }
  });
  console.log("CUSTOM_COMPUTERS options count:", options.length);
  // Group options by fieldId
  const grouped = {};
  options.forEach(o => {
    if (!grouped[o.fieldId]) grouped[o.fieldId] = [];
    grouped[o.fieldId].push(o.value);
  });
  console.log("Grouped options:", JSON.stringify(grouped, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
