const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding new AIO fields in CategoryFormStructure...');

  const fieldsToSeed = [
    {
      category: 'AIO',
      fieldId: 'color',
      labelHera: 'צבע',
      fieldType: 'select',
      order: 15,
      isRequired: false,
      isDynamic: false,
      sectionName: 'מצב כללי',
      colSpan: 1
    },
    {
      category: 'AIO',
      fieldId: 'releaseYear',
      labelHera: 'שנת דגם',
      fieldType: 'select',
      order: 16,
      isRequired: false,
      isDynamic: false,
      sectionName: 'זיהוי יצרן (סדרה)',
      colSpan: 1
    },
    {
      category: 'AIO',
      fieldId: 'resolutionType',
      labelHera: 'סוג רזולוציה',
      fieldType: 'select',
      order: 25,
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
    console.log(`Upserted CategoryFormStructure field: ${upserted.fieldId} (${upserted.labelHera})`);
  }

  const optionsToSeed = [
    // color
    { category: 'AIO', fieldId: 'color', value: 'ירוק (Green)' },
    { category: 'AIO', fieldId: 'color', value: 'כחול (Blue)' },
    { category: 'AIO', fieldId: 'color', value: 'ורוד (Pink)' },
    { category: 'AIO', fieldId: 'color', value: 'כסף (Silver)' },
    { category: 'AIO', fieldId: 'color', value: 'אפור חלל (Space Gray)' },
    { category: 'AIO', fieldId: 'color', value: 'צהוב (Yellow)' },
    { category: 'AIO', fieldId: 'color', value: 'כתום (Orange)' },
    { category: 'AIO', fieldId: 'color', value: 'סגול (Purple)' },
    
    // releaseYear
    { category: 'AIO', fieldId: 'releaseYear', value: '2020' },
    { category: 'AIO', fieldId: 'releaseYear', value: '2021' },
    { category: 'AIO', fieldId: 'releaseYear', value: '2022' },
    { category: 'AIO', fieldId: 'releaseYear', value: '2023' },
    { category: 'AIO', fieldId: 'releaseYear', value: '2024' },
    { category: 'AIO', fieldId: 'releaseYear', value: '2025' },
    { category: 'AIO', fieldId: 'releaseYear', value: '2026' },

    // resolutionType
    { category: 'AIO', fieldId: 'resolutionType', value: '4.5K' },
    { category: 'AIO', fieldId: 'resolutionType', value: '5K' },
    { category: 'AIO', fieldId: 'resolutionType', value: '4K' },
    { category: 'AIO', fieldId: 'resolutionType', value: 'Retina' },
    { category: 'AIO', fieldId: 'resolutionType', value: 'FHD' },
    { category: 'AIO', fieldId: 'resolutionType', value: 'QHD' }
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
