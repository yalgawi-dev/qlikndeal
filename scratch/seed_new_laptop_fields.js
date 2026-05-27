const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding new computer fields in CategoryFormStructure...');

  const fieldsToSeed = [
    {
      category: 'LAPTOPS',
      fieldId: 'refreshRate',
      labelHera: 'קצב רענון מסך',
      fieldType: 'select',
      order: 57,
      isRequired: false,
      isDynamic: false,
      sectionName: 'מסך ותצוגה',
      colSpan: 1
    },
    {
      category: 'LAPTOPS',
      fieldId: 'resolutionType',
      labelHera: 'סוג רזולוציה',
      fieldType: 'select',
      order: 56,
      isRequired: false,
      isDynamic: false,
      sectionName: 'מסך ותצוגה',
      colSpan: 1
    },
    {
      category: 'LAPTOPS',
      fieldId: 'extraStorage',
      labelHera: 'אחסון נוסף',
      fieldType: 'select',
      order: 65,
      isRequired: false,
      isDynamic: false,
      sectionName: 'רכיבים פנימיים',
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
    console.log(`Upserted CategoryFormStructure field: ${upserted.fieldId} (${upserted.labelHera})`);
  }

  const optionsToSeed = [
    // refreshRate
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '60Hz' },
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '90Hz' },
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '120Hz' },
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '144Hz' },
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '165Hz' },
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '240Hz' },
    { category: 'LAPTOPS', fieldId: 'refreshRate', value: '360Hz' },

    // resolutionType
    { category: 'LAPTOPS', fieldId: 'resolutionType', value: 'FHD' },
    { category: 'LAPTOPS', fieldId: 'resolutionType', value: 'QHD' },
    { category: 'LAPTOPS', fieldId: 'resolutionType', value: 'UHD' },
    { category: 'LAPTOPS', fieldId: 'resolutionType', value: '2K' },
    { category: 'LAPTOPS', fieldId: 'resolutionType', value: '4K' },
    { category: 'LAPTOPS', fieldId: 'resolutionType', value: 'Retina' },

    // extraStorage
    { category: 'LAPTOPS', fieldId: 'extraStorage', value: 'ללא' },
    { category: 'LAPTOPS', fieldId: 'extraStorage', value: '256GB SSD' },
    { category: 'LAPTOPS', fieldId: 'extraStorage', value: '512GB SSD' },
    { category: 'LAPTOPS', fieldId: 'extraStorage', value: '1TB SSD' },
    { category: 'LAPTOPS', fieldId: 'extraStorage', value: '2TB SSD' },
    { category: 'LAPTOPS', fieldId: 'extraStorage', value: '1TB HDD' }
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
