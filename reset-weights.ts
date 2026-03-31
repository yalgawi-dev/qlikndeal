import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function reset() {
  console.log('🔄 מתחיל איפוס משקולות לערכי ברירת מחדל...');

  const defaultWeights = {
    performance: 0.2,
    display_quality: 0.2,
    portability: 0.2,
    battery_life: 0.2,
    storage_capacity: 0.2
  };

  try {
    // איפוס לפטופים
    await (prisma as any).laptopCatalog.updateMany({
      data: { weights: defaultWeights }
    });
    console.log('✅ טבלת לפטופים אופסה');

    // איפוס סלולר
    await (prisma as any).mobileCatalog.updateMany({
      data: { weights: defaultWeights }
    });
    console.log('✅ טבלת סלולר אופסה');

    console.log('\n✨ ה-DB נקי ומוכן לסריקה חדשה!');
  } catch (err) {
    console.error('שגיאה באיפוס:', err);
  }
}

reset().finally(() => prisma.$disconnect());