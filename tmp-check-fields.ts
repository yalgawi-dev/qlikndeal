import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const f = await db.categoryFormStructure.findMany({ where: { category: 'LAPTOPS' } });
  console.log(f.map(x => x.fieldId));
}
main().finally(() => db.$disconnect());
