const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const anchors = await prisma.fieldAnchor.findMany({
    where: { category: 'LAPTOPS', relatedFields: { has: 'gpu' } }
  });
  console.log('GPU Anchors:', anchors.map(a => ({ phrase: a.phrase, expectedType: a.expectedType, direction: a.expectedDirection })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
