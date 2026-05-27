const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting Apple CPU options for CUSTOM_COMPUTERS from FormFieldOption...");

  const category = "CUSTOM_COMPUTERS";
  const fieldId = "cpu";

  // Find all options first to see what we are deleting
  const options = await prisma.formFieldOption.findMany({
    where: { category, fieldId }
  });

  console.log(`Current CPU options count: ${options.length}`);

  let deletedCount = 0;

  for (const opt of options) {
    const valLower = opt.value.toLowerCase();
    const isApple = valLower.includes("apple") || valLower.includes("m1") || valLower.includes("m2") || valLower.includes("m3") || valLower.includes("m4");
    
    if (isApple) {
      console.log(`Deleting: ${opt.value}`);
      await prisma.formFieldOption.delete({
        where: { id: opt.id }
      });
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} Apple CPU options successfully!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
