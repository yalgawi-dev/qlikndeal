import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Checking UserCorrections ---");
  const corrections = await prisma.userCorrection.findMany({
    where: {
      OR: [
        { originalText: { contains: "מפלצת" } },
        { originalText: { contains: "גיימינג" } },
        { originalText: { contains: "ASUS" } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(corrections, null, 2));

  console.log("\n--- Checking FieldValueReliability for 'מפלצת' and 'גיימינג' ---");
  const reliabilities = await prisma.fieldValueReliability.findMany({
    where: {
      OR: [
        { value: { contains: "מפלצת" } },
        { value: { contains: "גיימינג" } },
        { value: { contains: "ASUS" } },
        { value: { contains: "ROG" } }
      ]
    }
  });
  console.log(JSON.stringify(reliabilities, null, 2));

  console.log("\n--- Checking ContextPattern for 'מפלצת' and 'גיימינג' ---");
  const patterns = await prisma.contextPattern.findMany({
    where: {
      OR: [
        { patternPart: { contains: "מפלצת" } },
        { patternPart: { contains: "גיימינג" } },
        { patternPart: { contains: "ASUS" } },
        { patternPart: { contains: "ROG" } }
      ]
    }
  });
  console.log(JSON.stringify(patterns, null, 2));

  console.log("\n--- Checking FieldSignal ---");
  const signals = await prisma.fieldSignal.findMany({
    where: {
      OR: [
        { rawValue: { contains: "מפלצת" } },
        { rawValue: { contains: "גיימינג" } },
        { rawValue: { contains: "ASUS" } },
        { rawValue: { contains: "ROG" } }
      ]
    }
  });
  console.log(JSON.stringify(signals, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
