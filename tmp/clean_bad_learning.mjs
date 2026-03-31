import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

console.log("🧹 מנקה נתוני למידה פגומים...\n");

// 1. מחק "batteryPercent" (שם שדה ישן) - fieldId הנכון הוא "batteryHealth"
const delBattery = await p.fieldValueReliability.deleteMany({
    where: { field: "batteryPercent" }
});
console.log(`✅ מחקתי ${delBattery.count} רשומות "batteryPercent" (שם שדה ישן)`);

// 2. מחק "Numeric" - שדה זבל מה-NLP
const delNumeric = await p.fieldValueReliability.deleteMany({
    where: { field: { in: ["Numeric", "numeric", "General", "general"] } }
});
console.log(`✅ מחקתי ${delNumeric.count} רשומות Numeric/General (זבל NLP)`);

// 3. מחק "batteryPercent" גם מ-FieldSignal
const delBattSignal = await p.fieldSignal.deleteMany({
    where: { field: "batteryPercent" }
});
console.log(`✅ מחקתי ${delBattSignal.count} FieldSignal batteryPercent`);

// 4. תיקון: "Numeric" גם ב-ContextPattern
const delNumericPattern = await p.contextPattern.deleteMany({
    where: { field: { in: ["Numeric", "numeric", "General", "general"] } }
});
console.log(`✅ מחקתי ${delNumericPattern.count} ContextPattern Numeric/General`);

// 5. בדיקה אחרי הניקוי
const remaining = await p.fieldValueReliability.count({ where: { category: "LAPTOPS" } });
const signals = await p.fieldSignal.count({ where: { category: "LAPTOPS" } });
console.log(`\n📊 נשאר לאחר ניקוי: ${remaining} FieldValueReliability, ${signals} FieldSignal`);

console.log("\n✅ ניקוי הושלם!");
await p.$disconnect();
