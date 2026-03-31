import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- בדיקת מנוע פריזמה ---");
  
  // בוא נראה מה המחשב באמת רואה בתוך ה-Database
  const tables = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log("טבלאות שזוהו:", tables);

  if (!(prisma as any).appConfig) {
    console.error("❌ הטבלה appConfig עדיין לא מזוהה בקוד. מנסה דרך חלופית...");
  }

  try {
    // שימוש בגישה גמישה יותר למקרה שהטייפינג לא התעדכן
    const res = await (prisma as any).appConfig.upsert({
      where: { id: 'system_config' },
      update: {},
      create: {
        id: 'system_config',
        expertStep: 0.10,
        maxWeight: 0.95
      }
    });

    console.log("✅ הצלחנו! ה-AppConfig עודכן ל-0.10");
    console.log("נתונים שנשמרו:", res);
  } catch (error: any) {
    console.error("❌ שגיאה סופית:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();