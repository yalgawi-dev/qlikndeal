const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  {
    categoryNameHe: "משרד/למידה",
    categoryNameEn: "Office",
    description: "מתאים לעבודה משרדית, לימודים, גלישה באינטרנט וצפייה בסרטים.",
    minCpuTier: "i3",
    minRamGb: 16,
    minStorageGb: 512,
    storageType: "SSD NVMe",
    recommendedGpu: "Integrated",
    manufacturerRecommendation: "מחשב אמין עם חיי סוללה טובים ומקלדת נוחה לעבודה ממושכת.",
    dynamicAttributes: {
      tags: ["משרד", "סטודנטים", "למידה", "זול"],
      icon: "Briefcase"
    }
  },
  {
    categoryNameHe: "גיימינג",
    categoryNameEn: "Gaming",
    description: "מותאם להרצת משחקים חדשים בקצב רענון גבוה ואיכות גרפית מצוינת.",
    minCpuTier: "i5",
    minRamGb: 16,
    minStorageGb: 1024,
    storageType: "SSD NVMe",
    recommendedGpu: "RTX 4060",
    manufacturerRecommendation: "מערכת קירור מתקדמת, מסך עם תדר רענון של 144Hz ומעלה, וכרטיס מסך ייעודי של NVIDIA/AMD.",
    dynamicAttributes: {
      tags: ["גיימינג", "משחקים", "ביצועים", "גרפיקה"],
      icon: "Gamepad2"
    }
  },
  {
    categoryNameHe: "עריכה וגרפיקה",
    categoryNameEn: "Content Creation",
    description: "מיועד לעורכי וידאו, גרפיקאים, יוצרי תוכן ומעצבים בתלת-מימד.",
    minCpuTier: "i7",
    minRamGb: 32,
    minStorageGb: 1024,
    storageType: "SSD NVMe",
    recommendedGpu: "RTX 4060 Ti",
    manufacturerRecommendation: "מסך בעל דיוק צבעים גבוה (OLED או IPS עם כיסוי DCI-P3 רחב), ומעבד חזק מרובה ליבות.",
    dynamicAttributes: {
      tags: ["עריכה", "פוטושופ", "פרמייר", "עיצוב", "תלת מימד"],
      icon: "Paintbrush"
    }
  },
  {
    categoryNameHe: "פיתוח תוכנה",
    categoryNameEn: "Development",
    description: "מתאים למפתחי תוכנה, הרצת קונטיינרים, מכונות וירטואליות וסביבות פיתוח כבדות.",
    minCpuTier: "i5",
    minRamGb: 32,
    minStorageGb: 1024,
    storageType: "SSD NVMe",
    recommendedGpu: "Integrated",
    manufacturerRecommendation: "מעבד חזק (i7/Ryzen 7 מומלץ), זיכרון עבודה גדול לפעילות מקבילית, ומקלדת איכותית.",
    dynamicAttributes: {
      tags: ["פיתוח", "תכנות", "קוד", "Docker", "VSCode"],
      icon: "Code"
    }
  },
  {
    categoryNameHe: "נייד לדרכים",
    categoryNameEn: "Ultra-Portable",
    description: "מיועד לאנשים שנמצאים בתנועה מתמדת וזקוקים למחשב קל משקל עם סוללה חזקה.",
    minCpuTier: "i5", // Core Ultra 5 / Ryzen 5 U / Apple M1
    minRamGb: 16,
    minStorageGb: 512,
    storageType: "SSD NVMe",
    recommendedGpu: "Integrated",
    manufacturerRecommendation: "חיי סוללה של 10+ שעות, משקל נמוך מ-1.4 ק\"ג, ותמיכה בטעינה מהירה (USB-C Power Delivery).",
    dynamicAttributes: {
      tags: ["נייד", "סוללה", "קל משקל", "נסיעות"],
      icon: "Laptop"
    }
  }
];

async function main() {
  console.log("Start seeding computer purchase categories...");
  
  for (const cat of categories) {
    const upserted = await prisma.computerUseCategory.upsert({
      where: { id: categories.indexOf(cat) + 1 }, // temporary unique identifier mapping
      update: {
        categoryNameHe: cat.categoryNameHe,
        categoryNameEn: cat.categoryNameEn,
        description: cat.description,
        minCpuTier: cat.minCpuTier,
        minRamGb: cat.minRamGb,
        minStorageGb: cat.minStorageGb,
        storageType: cat.storageType,
        recommendedGpu: cat.recommendedGpu,
        manufacturerRecommendation: cat.manufacturerRecommendation,
        dynamicAttributes: cat.dynamicAttributes,
      },
      create: {
        categoryNameHe: cat.categoryNameHe,
        categoryNameEn: cat.categoryNameEn,
        description: cat.description,
        minCpuTier: cat.minCpuTier,
        minRamGb: cat.minRamGb,
        minStorageGb: cat.minStorageGb,
        storageType: cat.storageType,
        recommendedGpu: cat.recommendedGpu,
        manufacturerRecommendation: cat.manufacturerRecommendation,
        dynamicAttributes: cat.dynamicAttributes,
      }
    });
    console.log(`Seeded category: ${upserted.categoryNameHe} (${upserted.categoryNameEn})`);
  }
  
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
