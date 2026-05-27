const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding extraStorage1 and extraStorage2 fields for CUSTOM_COMPUTERS...");

  const category = "CUSTOM_COMPUTERS";

  const fields = [
    {
      fieldId: "extraStorage1",
      labelHera: "נפח אחסון נוסף 1",
      fieldType: "select",
      sectionName: "מפרט טכני",
      order: 61,
      icon: "HardDrive",
      colSpan: 1,
      isRequired: false,
      isDynamic: false
    },
    {
      fieldId: "extraStorage2",
      labelHera: "נפח אחסון נוסף 2",
      fieldType: "select",
      sectionName: "מפרט טכני",
      order: 62,
      icon: "HardDrive",
      colSpan: 1,
      isRequired: false,
      isDynamic: false
    }
  ];

  for (const f of fields) {
    await prisma.categoryFormStructure.upsert({
      where: { category_fieldId: { category, fieldId: f.fieldId } },
      update: {
        labelHera: f.labelHera,
        fieldType: f.fieldType,
        sectionName: f.sectionName,
        order: f.order,
        icon: f.icon,
        colSpan: f.colSpan,
        isRequired: f.isRequired
      },
      create: {
        category,
        fieldId: f.fieldId,
        labelHera: f.labelHera,
        fieldType: f.fieldType,
        sectionName: f.sectionName,
        order: f.order,
        icon: f.icon,
        colSpan: f.colSpan,
        isRequired: f.isRequired,
        isDynamic: f.isDynamic
      }
    });
    console.log(`Upserted field ${f.fieldId}`);
  }

  // Fetch options for primary storage
  const storageOptions = await prisma.formFieldOption.findMany({
    where: { category, fieldId: "storage" }
  });

  const optionValues = storageOptions.map(o => o.value);
  if (!optionValues.includes("ללא")) {
    optionValues.unshift("ללא"); // Add "ללא" (None) at the beginning of additional storages
  }

  console.log(`Copying ${optionValues.length} storage options to extraStorage1 & extraStorage2...`);

  for (const val of optionValues) {
    for (const fieldId of ["extraStorage1", "extraStorage2"]) {
      await prisma.formFieldOption.upsert({
        where: { category_fieldId_value: { category, fieldId, value: val } },
        update: {},
        create: {
          category,
          fieldId,
          value: val,
          isDynamic: false
        }
      });
    }
  }

  console.log("Completed seeding additional storage fields and options successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
