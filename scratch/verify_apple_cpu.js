const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking custom computer CPU options in DB...");
  const options = await prisma.formFieldOption.findMany({
    where: { category: "CUSTOM_COMPUTERS", fieldId: "cpu" }
  });

  let appleCount = 0;
  options.forEach(o => {
    const valLower = o.value.toLowerCase();
    if (valLower.includes("apple") || valLower.includes("m1") || valLower.includes("m2") || valLower.includes("m3") || valLower.includes("m4")) {
      console.log(`⚠️ Apple CPU found: ${o.value}`);
      appleCount++;
    }
  });

  if (appleCount === 0) {
    console.log("✅ SUCCESS: No Apple CPUs found in CUSTOM_COMPUTERS options!");
  } else {
    console.log(`❌ FAILURE: Found ${appleCount} Apple CPUs!`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
