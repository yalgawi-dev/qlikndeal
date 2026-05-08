const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("Adding 'color' to SMARTPHONES...");
  
  // 1. Add color to SMARTPHONES structure
  await prisma.categoryFormStructure.upsert({
    where: { category_fieldId: { category: 'SMARTPHONES', fieldId: 'color' } },
    update: { labelHera: "צבע מכשיר", fieldType: "select", sectionName: "זיהוי פרטי מכשיר", order: 35 },
    create: { category: 'SMARTPHONES', fieldId: 'color', labelHera: "צבע מכשיר", fieldType: "select", sectionName: "זיהוי פרטי מכשיר", order: 35 }
  });

  const colors = ["שחור", "לבן", "כסוף", "זהב", "כחול", "אדום", "ירוק", "סגול", "טיטניום טבעי", "טיטניום שחור", "טיטניום לבן", "טיטניום כחול", "ורוד", "אפור"];
  for (const value of colors) {
    await prisma.formFieldOption.upsert({
      where: { category_fieldId_value: { category: 'SMARTPHONES', fieldId: 'color', value } },
      update: {},
      create: { category: 'SMARTPHONES', fieldId: 'color', value, isDynamic: false }
    });
  }

  console.log("Setting up SCREENS category...");

  // 2. Set up SCREENS Structure
  const screenFields = [
    { fieldId: "brand", labelHera: "יצרן", fieldType: "select", sectionName: "מפרט כללי", order: 10 },
    { fieldId: "screenSize", labelHera: "גודל מסך (אינץ')", fieldType: "select", sectionName: "מפרט כללי", order: 20 },
    { fieldId: "resolution", labelHera: "רזולוציה", fieldType: "select", sectionName: "התצוגה (מסך)", order: 30 },
    { fieldId: "panelTech", labelHera: "טכנולוגיית פאנל", fieldType: "select", sectionName: "התצוגה (מסך)", order: 40 },
    { fieldId: "condition", labelHera: "מצב", fieldType: "select", sectionName: "מצב המוצר", order: 50 },
  ];

  // We map it to TVS and SCREENS just to be hyper safe depending on the frontend payload
  const screenCategories = ['SCREENS', 'TVS', 'טלוויזיות'];

  for (const cat of screenCategories) {
    for (const f of screenFields) {
      await prisma.categoryFormStructure.upsert({
        where: { category_fieldId: { category: cat, fieldId: f.fieldId } },
        update: { labelHera: f.labelHera, fieldType: f.fieldType, sectionName: f.sectionName, order: f.order },
        create: { category: cat, ...f }
      });
    }

    const screenSizes = ["32", "40", "43", "48", "50", "55", "58", "65", "70", "75", "77", "83", "85", "86", "98", "100"];
    const resolutions = ["4K", "8K", "Full HD (1080p)", "HD Ready (720p)", "QHD"];
    const panelTechs = ["OLED", "QLED", "NEO QLED", "Mini LED", "Micro LED", "LED", "NanoCell", "Plasma"];
    const brands = ["Samsung", "LG", "Sony", "Hisense", "TCL", "Philips", "Panasonic", "Xiaomi"];

    const screenOptions = [
      { fieldId: "screenSize", values: screenSizes },
      { fieldId: "resolution", values: resolutions },
      { fieldId: "panelTech", values: panelTechs },
      { fieldId: "brand", values: brands },
    ];

    for (const opt of screenOptions) {
      for (const value of opt.values) {
        await prisma.formFieldOption.upsert({
          where: { category_fieldId_value: { category: cat, fieldId: opt.fieldId, value } },
          update: {},
          create: { category: cat, fieldId: opt.fieldId, value, isDynamic: false }
        });
      }
    }
  }

  console.log("Done adding Screens and Smartphone Color!");
}

seed().finally(() => prisma.$disconnect());
