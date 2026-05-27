const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.laptopCatalog.findMany({
    where: {
      modelName: { contains: 'LOQ', mode: 'insensitive' }
    }
  });
  console.log('Matches in LaptopCatalog:', JSON.stringify(matches.map(m => ({
    brand: m.brand,
    series: m.series,
    modelName: m.modelName,
    cpu: m.cpu,
    gpu: m.gpu,
    ram: m.ram
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
