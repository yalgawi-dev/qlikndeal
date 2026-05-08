const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const category = "SMARTPHONES";

const options = [
  // יצרנים
  { 
    fieldId: "brand", 
    values: [
      "Apple", "Samsung", "Xiaomi", "Google", "OnePlus", 
      "Oppo", "Huawei", "Nothing", "Realme", "Asus", 
      "Sony", "Motorola", "Nokia", "POCO", "Vivo"
    ] 
  },
  
  // זיכרון (RAM)
  { 
    fieldId: "ram", 
    values: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "18GB", "24GB"] 
  },
  
  // נפח אחסון (Storage)
  { 
    fieldId: "storage", 
    values: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] 
  },

  // מצבים מוגדרים מראש
  {
    fieldId: "condition",
    values: ["חדש", "כמו חדש", "מחודש", "משומש"]
  }
];

async function seed() {
  console.log(`Starting to seed robust defaults for category: ${category}...`);
  let count = 0;
  
  for (const { fieldId, values } of options) {
    for (const value of values) {
      // כאן אנו מבצעים UPSERT בטוח - אם הערך קיים הוא מדלג, אם לא הוא יוצר
      // זה מונע כפילויות ומקיים את חוקי הארכיטקטורה שהנחנו
      await prisma.formFieldOption.upsert({
        where: {
          category_fieldId_value: { category, fieldId, value }
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
  
  console.log(`✅ Successfully seeded ${count} predefined smartphone options into the database.`);
}

seed()
  .catch(e => {
    console.error("❌ Error occurred:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
