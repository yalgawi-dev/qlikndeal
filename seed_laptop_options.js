const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const category = "LAPTOPS";

// אלו השדות עם הערכים השכיחים ביותר ב-10 השנים האחרונות (לפי בקשתך להקל על ממלא הטופס):
const options = [
  // מעבדים
  { 
    fieldId: "cpu", 
    values: [
      "Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", 
      "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9", 
      "Intel Core M", "Intel Pentium", "Intel Celeron",
      "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9",
      "AMD Athlon", "Apple M1", "Apple M1 Pro", "Apple M1 Max", 
      "Apple M2", "Apple M2 Pro", "Apple M2 Max", 
      "Apple M3", "Apple M3 Pro", "Apple M3 Max"
    ] 
  },
  
  // זיכרון (RAM)
  { 
    fieldId: "ram", 
    values: ["4GB", "8GB", "12GB", "16GB", "24GB", "32GB", "48GB", "64GB"] 
  },
  
  // גודל מסך (אינצ'ים) — fieldId חייב להתאים ל-CategoryFormStructure: "screen"
  { 
    fieldId: "screen", 
    values: ["11.6\"", "12\"", "12.5\"", "13.3\"", "13.4\"", "13.5\"", "13.6\"", "14\"", "14.2\"", "15\"", "15.6\"", "16\"", "16.2\"", "17.3\"", "18\""] 
  },
  
  // מערכות הפעלה
  { 
    fieldId: "os", 
    values: [
      "Windows 10 Home", "Windows 10 Pro", 
      "Windows 11 Home", "Windows 11 Pro", 
      "macOS", "Chrome OS", "Linux", 
      "FreeDOS", "ללא מערכת הפעלה"
    ] 
  },
  
  // נפח אחסון
  { 
    fieldId: "storage", 
    values: [
      "128GB SSD", "256GB SSD", "512GB SSD", 
      "1TB SSD", "2TB SSD", "4TB SSD",
      "500GB HDD", "1TB HDD"
    ] 
  },

  // כרטיס מסך / GPU
  { 
    fieldId: "gpu", 
    values: [
      "Intel UHD Graphics", "Intel Iris Xe", "Intel Arc", 
      "AMD Radeon Graphics", 
      "NVIDIA GeForce GTX 1050", "NVIDIA GeForce GTX 1650", 
      "NVIDIA GeForce RTX 3050", "NVIDIA GeForce RTX 3060", "NVIDIA GeForce RTX 3070", "NVIDIA GeForce RTX 3080", 
      "NVIDIA GeForce RTX 4050", "NVIDIA GeForce RTX 4060", "NVIDIA GeForce RTX 4070", "NVIDIA GeForce RTX 4080", "NVIDIA GeForce RTX 4090", 
      "Apple GPU", "Shared/Integrated Graphics"
    ] 
  },

  // מותגים / Brands
  { 
    fieldId: "brand", 
    values: [
      "Lenovo", "Dell", "HP", "Asus", "Acer", "Apple", 
      "MSI", "Gigabyte", "Razer", "Microsoft", "Samsung", "LG", "Huawei"
    ] 
  }
];

async function seed() {
  console.log(`Starting to seed default options for category: ${category}...`);
  let count = 0;
  
  for (const { fieldId, values } of options) {
    for (const value of values) {
      await prisma.formFieldOption.upsert({
        where: {
          category_fieldId_value: {
            category,
            fieldId,
            value
          }
        },
        update: {},
        create: {
          category,
          fieldId,
          value,
          isDynamic: false
        }
      });
      count++;
    }
  }
  
  console.log(`✅ Successfully seeded ${count} predefined laptop options into the database.`);
  
  // אני מוסיף גם את שדות המבנה (CategoryFormStructure) רק למקרה שהם עדיין לא קיימים שם:
  console.log(`Ensuring UI fields are configured in CategoryFormStructure...`);
  const formStructures = [
    { fieldId: "brand", labelHera: "יצרן", fieldType: "select", order: 10, sectionName: "מפרט כללי" },
    { fieldId: "cpu", labelHera: "מעבד", fieldType: "select", order: 20, sectionName: "רכיבים פנימיים" },
    { fieldId: "ram", labelHera: "זיכרון (RAM)", fieldType: "select", order: 30, sectionName: "רכיבים פנימיים" },
    { fieldId: "storage", labelHera: "נפח אחסון", fieldType: "select", order: 40, sectionName: "רכיבים פנימיים" },
    { fieldId: "screen", labelHera: "גודל מסך", fieldType: "select", order: 50, sectionName: "מסך ותצוגה" },
    { fieldId: "gpu", labelHera: "כרטיס מסך", fieldType: "select", order: 60, sectionName: "רכיבים פנימיים" },
    { fieldId: "os", labelHera: "מערכת הפעלה", fieldType: "select", order: 70, sectionName: "מפרט כללי" }
  ];

  for (const field of formStructures) {
    await prisma.categoryFormStructure.upsert({
      where: {
        category_fieldId: {
          category,
          fieldId: field.fieldId
        }
      },
      update: {
        labelHera: field.labelHera,
        fieldType: field.fieldType,
        sectionName: field.sectionName
      },
      create: {
        category,
        fieldId: field.fieldId,
        labelHera: field.labelHera,
        fieldType: field.fieldType,
        order: field.order,
        sectionName: field.sectionName,
        isDynamic: false,
        isRequired: false
      }
    });
  }
  
  console.log(`✅ Form structures checked and updated.`);
}

seed()
  .catch(e => {
    console.error("❌ Error occurred:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
