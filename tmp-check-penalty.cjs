const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPenalty() {
  console.log("=== CHECKING THE WORD 'נייד' IN THE PENALTY SYSTEM ===");

  const signal = await prisma.fieldSignal.findFirst({
    where: { field: 'brand', rawValue: 'נייד', category: 'LAPTOPS' }
  });
  console.log("\n1. Field Signal Table (Direct connection):");
  console.log(signal ? JSON.stringify(signal, null, 2) : "Not found!");

  const dict = await prisma.fieldValueReliability.findFirst({
    where: { field: 'brand', value: 'נייד', category: 'LAPTOPS' }
  });
  console.log("\n2. Dictionary Table (Reliability):");
  console.log(dict ? JSON.stringify(dict, null, 2) : "Not found!");

  const context = await prisma.contextPattern.findFirst({
    where: { patternPart: 'brand', field: 'brand', category: 'LAPTOPS' },
    include: { parent: true }
  });
  // Note: we can't easily find specifically "נייד" in contextPattern unless we search parent.patternPart
  const specificContext = await prisma.contextPattern.findMany({
    where: { category: 'LAPTOPS', type: 'FIELD', field: 'brand' },
    include: { parent: true }
  });
  
  const badContext = specificContext.filter(c => c.parent && c.parent.patternPart === 'נייד');
  if (badContext.length > 0) {
     console.log("\n3. Context Pattern Table (DNA):");
     console.log(JSON.stringify(badContext, null, 2));
  }
  
  await prisma.$disconnect();
}
checkPenalty().catch(console.error);
