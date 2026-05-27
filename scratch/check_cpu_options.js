const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const opts = await prisma.formFieldOption.findMany({
    where: { category: 'LAPTOPS', fieldId: 'cpu' },
    take: 30
  });
  console.log('CPU options:', opts.map(o => o.value));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
