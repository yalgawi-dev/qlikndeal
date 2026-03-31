import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLaptopsState() {
    console.log("=== מילון הלמידה הנוכחי (לפטופים) ===");
    
    // שליפת מילים שנלמדו
    const learned = await prisma.fieldValueReliability.findMany({ 
        where: { category: 'LAPTOPS' }
    });
    
    if (learned.length === 0) {
        console.log("המילון כרגע ריק לחלוטין. ה-AI עדיין לא שמר שום מילה מתוך טופס הלפטופים (מצב התחלתי).");
    } else {
        learned.forEach(s => {
            console.log(`- שדה: [${s.field}] | השם המלא: "${s.value}" | ביטחון (משקל): ${s.confidence.toFixed(2)} | כמות מופעים שאושרו: ${s.occurrenceCount}`);
        });
    }

    console.log("\n=== חוקי דריסה (Thresholds) שנקבעו באדמין ===");
    const thresh = await prisma.categoryFieldThreshold.findMany({
        where: { category: 'LAPTOPS' }
    });
    
    thresh.forEach(t => {
        console.log(`- [${t.field}] | מילוי אוטומטי (Fill): ${t.threshold.toFixed(2)} | יוצג כהצעה צהובה (Suggest) מעל: ${(t.threshold - t.suggestionMargin).toFixed(2)}`);
    });
    
    console.log("\n=== חוקי תשתית গלובליים (Global) ===");
    console.log(`- מילוי אוטומטי (Fill) לשאר השדות: 0.85`);
    console.log(`- יוצג כהצעה צהובה (Suggest) לשאר השדות מעל: 0.45`);
}

checkLaptopsState().finally(() => prisma.$disconnect());
