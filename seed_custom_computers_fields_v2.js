const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding advanced CUSTOM_COMPUTERS fields and options...");

  const category = 'CUSTOM_COMPUTERS';

  const fields = [
    {
      fieldId: 'cpuCooler',
      labelHera: 'קירור מעבד (Cooler)',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 45,
      icon: 'Cpu',
      colSpan: 1,
    },
    {
      fieldId: 'ramTypeSpeed',
      labelHera: 'סוג ומהירות זיכרון RAM',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 55,
      icon: 'MemoryStick',
      colSpan: 1,
    },
    {
      fieldId: 'storageType',
      labelHera: 'סוג כונן אחסון',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 63,
      icon: 'HardDrive',
      colSpan: 1,
    },
    {
      fieldId: 'motherboardPorts',
      labelHera: 'חיבורים ויציאות לוח אם',
      fieldType: 'select',
      sectionName: 'מפרט טכני',
      order: 84,
      icon: 'Settings',
      colSpan: 1,
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

  const options = [
    {
      fieldId: 'cpuCooler',
      values: [
        "מאוורר אוויר סטנדרטי (Intel/AMD Stock Cooler)",
        "קירור אוויר premium (Noctua/BeQuiet/Thermalright)",
        "קירור מים (AIO) 120mm",
        "קירור מים (AIO) 240mm",
        "קירור מים (AIO) 280mm",
        "קירור מים (AIO) 360mm",
        "קירור מים מותאם אישית (Custom Loop)"
      ]
    },
    {
      fieldId: 'ramTypeSpeed',
      values: [
        "DDR4 3200MHz",
        "DDR4 3600MHz",
        "DDR4 4000MHz+",
        "DDR5 4800MHz",
        "DDR5 5200MHz",
        "DDR5 5600MHz",
        "DDR5 6000MHz",
        "DDR5 6400MHz+"
      ]
    },
    {
      fieldId: 'storageType',
      values: [
        "NVMe M.2 SSD (מהיר במיוחד)",
        "SATA 2.5\" SSD",
        "HDD (דיסק קשיח מכני)",
        "שילוב: NVMe SSD + HDD",
        "שילוב: SATA SSD + HDD"
      ]
    },
    {
      fieldId: 'motherboardPorts',
      values: [
        "HDMI + DisplayPort",
        "חיבור רשת קווי 2.5Gb LAN",
        "WiFi מובנה + Bluetooth",
        "WiFi מובנה + 2.5Gb LAN",
        "Type-C אחורי מהיר",
        "תמיכה ב-PCIe Gen 5",
        "תמיכה ב-Thunderbolt 4 / USB4"
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

  console.log("CUSTOM_COMPUTERS advanced fields and options seeded successfully!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
