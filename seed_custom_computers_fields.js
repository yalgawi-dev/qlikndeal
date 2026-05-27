const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("Adding custom fields to CUSTOM_COMPUTERS form structure...");

  const fields = [
    {
      fieldId: 'motherboard',
      labelHera: 'לוח אם',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 81,
      icon: 'Settings',
      colSpan: 1,
    },
    {
      fieldId: 'powerSupply',
      labelHera: 'ספק כוח',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 82,
      icon: 'Settings',
      colSpan: 1,
    },
    {
      fieldId: 'caseType',
      labelHera: 'סוג המארז',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 83,
      icon: 'Maximize2',
      colSpan: 1,
    }
  ];

  const category = 'CUSTOM_COMPUTERS';

  for (const f of fields) {
    await prisma.categoryFormStructure.upsert({
      where: { category_fieldId: { category, fieldId: f.fieldId } },
      update: {
        labelHera: f.labelHera,
        fieldType: f.fieldType,
        sectionName: f.sectionName,
        order: f.order,
        icon: f.icon,
        colSpan: f.colSpan
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
        isRequired: false,
        isDynamic: false
      }
    });
  }

  console.log("Seeding FormFieldOptions for CUSTOM_COMPUTERS fields...");

  const options = [
    {
      fieldId: 'caseType',
      values: [
        "ATX Mid Tower",
        "ATX Full Tower",
        "Micro-ATX Mini Tower",
        "Mini-ITX Desktop",
        "HTPC",
        "Dual-Chamber",
        "מארז פתוח (Open Frame)"
      ]
    },
    {
      fieldId: 'powerSupply',
      values: [
        "500W", "550W", "600W", "650W", "700W", "750W", "800W", "850W", "1000W", "1200W", "1600W",
        "550W 80+ Bronze", "650W 80+ Bronze", "750W 80+ Bronze",
        "750W 80+ Gold", "850W 80+ Gold", "1000W 80+ Gold", "1200W 80+ Platinum"
      ]
    },
    {
      fieldId: 'motherboard',
      values: [
        "Intel H610", "Intel B760", "Intel Z790", "Intel B660", "Intel Z690",
        "AMD A620", "AMD B650", "AMD X670", "AMD B550", "AMD X570", "AMD A320"
      ]
    }
  ];

  for (const opt of options) {
    for (const value of opt.values) {
      await prisma.formFieldOption.upsert({
        where: { category_fieldId_value: { category, fieldId: opt.fieldId, value } },
        update: {},
        create: { category, fieldId: opt.fieldId, value, isDynamic: false }
      });
    }
  }

  console.log("Successfully seeded CUSTOM_COMPUTERS new fields!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
