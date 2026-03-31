const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function migrate() {
  console.log('Migrating threshold categories...');
  await p.categoryFieldThreshold.updateMany({
    where: { category: 'MOBILES' },
    data: { category: 'PHONES' }
  });
  await p.categoryFieldThreshold.updateMany({
    where: { category: 'CARS' },
    data: { category: 'VEHICLES' }
  });
  
  // Seed basic fields if they don't exist
  const seed = [
    { cat: 'LAPTOPS', field: 'brand' },
    { cat: 'LAPTOPS', field: 'cpu' },
    { cat: 'LAPTOPS', field: 'ram' },
    { cat: 'PHONES', field: 'brand' },
    { cat: 'PHONES', field: 'modelName' }
  ];
  
  for (const s of seed) {
    const exists = await p.categoryFieldThreshold.findFirst({
        where: { category: s.cat, field: s.field }
    });
    if (!exists) {
        await p.categoryFieldThreshold.create({
            data: { category: s.cat, field: s.field, threshold: 0.8, suggestionMargin: 0.2 }
        });
        console.log(`Created default threshold for ${s.cat} / ${s.field}`);
    }
  }

  console.log('Done!');
}

migrate().finally(()=>p.$disconnect());
