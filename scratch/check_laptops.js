const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = 'LAPTOPS';
  
  // 1. FormFieldOption screen values
  const ffo = await prisma.formFieldOption.findMany({
    where: { category, fieldId: 'screen' }
  });
  console.log("FormFieldOption 'screen' values:", ffo.map(o => o.value));

  // 2. FieldValueReliability screen values
  const fvr = await prisma.fieldValueReliability.findMany({
    where: { category, field: 'screen' }
  });
  console.log("FieldValueReliability 'screen' values:", fvr.map(o => o.value));

  // 3. LaptopCatalog screenSize values
  const laptops = await prisma.laptopCatalog.findMany({
    select: { screenSize: true, display: true }
  });
  const uniqueScreenSizes = new Set();
  const uniqueDisplays = new Set();
  laptops.forEach(l => {
    if (l.screenSize) l.screenSize.forEach(s => uniqueScreenSizes.add(s));
    if (l.display) uniqueDisplays.add(l.display);
  });
  console.log("LaptopCatalog unique screenSize values:", Array.from(uniqueScreenSizes));
  console.log("LaptopCatalog unique display values (first 20):", Array.from(uniqueDisplays).slice(0, 20));
}

main().catch(console.error).finally(() => prisma.$disconnect());
