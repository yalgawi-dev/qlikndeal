const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding touchscreen fields in CategoryFormStructure...');

  const fieldsToSeed = [
    {
      category: 'LAPTOPS',
      fieldId: 'touchscreen',
      labelHera: 'מסך מגע',
      fieldType: 'select',
      order: 58,
      isRequired: false,
      isDynamic: false,
      sectionName: 'מסך ותצוגה',
      colSpan: 1
    },
    {
      category: 'AIO',
      fieldId: 'touchscreen',
      labelHera: 'מסך מגע',
      fieldType: 'select',
      order: 26,
      isRequired: false,
      isDynamic: false,
      sectionName: 'מפרט טכני',
      colSpan: 1
    }
  ];

  for (const field of fieldsToSeed) {
    const upserted = await prisma.categoryFormStructure.upsert({
      where: {
        category_fieldId: {
          category: field.category,
          fieldId: field.fieldId
        }
      },
      update: {
        labelHera: field.labelHera,
        fieldType: field.fieldType,
        order: field.order,
        sectionName: field.sectionName,
        colSpan: field.colSpan
      },
      create: field
    });
    console.log(`Upserted CategoryFormStructure field: ${upserted.fieldId} in ${upserted.category} (${upserted.labelHera})`);
  }

  const optionsToSeed = [
    { category: 'LAPTOPS', fieldId: 'touchscreen', value: 'כן' },
    { category: 'LAPTOPS', fieldId: 'touchscreen', value: 'לא' },
    { category: 'AIO', fieldId: 'touchscreen', value: 'כן' },
    { category: 'AIO', fieldId: 'touchscreen', value: 'לא' }
  ];

  console.log('Seeding form field options...');
  let optionCount = 0;
  for (const opt of optionsToSeed) {
    const existing = await prisma.formFieldOption.findUnique({
      where: {
        category_fieldId_value: {
          category: opt.category,
          fieldId: opt.fieldId,
          value: opt.value
        }
      }
    });

    if (!existing) {
      await prisma.formFieldOption.create({
        data: opt
      });
      optionCount++;
    }
  }
  console.log(`Seeded ${optionCount} new options successfully!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
