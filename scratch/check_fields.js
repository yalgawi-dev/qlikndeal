const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Check form structure fields for computer categories
  const fields = await p.categoryFormStructure.findMany({
    where: { category: { in: ['LAPTOPS', 'DESKTOPS', 'AIO'] } },
    select: { category: true, fieldId: true, labelHera: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }]
  });
  
  console.log('\n=== CategoryFormStructure fields ===');
  fields.forEach(f => console.log(f.category + ' | ' + f.fieldId + ' | ' + f.labelHera));

  // Check what field names are actually stored in extraData of real listings (sample)
  const listings = await p.marketplaceListing.findMany({
    where: { 
      category: { in: ['LAPTOPS', 'DESKTOPS', 'מחשבים ניידים', 'מחשב נייד', 'לפטופ'] },
      extraData: { not: null }
    },
    select: { id: true, category: true, extraData: true },
    take: 10
  });
  
  console.log('\n=== Sample extraData field keys from listings ===');
  listings.forEach(l => {
    try {
      const extra = JSON.parse(l.extraData || '{}');
      console.log('Category:', l.category, '| Keys:', Object.keys(extra).join(', '));
    } catch(e) {
      console.log('Category:', l.category, '| extraData parse error');
    }
  });

  // Check computer_use_categories table exists
  try {
    const cats = await p.computerUseCategory.findMany({
      select: { id: true, categoryNameEn: true, categoryNameHe: true, minRamGb: true, minStorageGb: true, minCpuTier: true, recommendedGpu: true }
    });
    console.log('\n=== ComputerUseCategory entries ===');
    cats.forEach(c => console.log(c.id, c.categoryNameEn, '| RAM:', c.minRamGb, '| Storage:', c.minStorageGb, '| CPU:', c.minCpuTier, '| GPU:', c.recommendedGpu));
  } catch(e) {
    console.log('\nComputerUseCategory error:', e.message);
  }
}

main().then(() => p.$disconnect()).catch(e => { console.error(e); p.$disconnect(); });
