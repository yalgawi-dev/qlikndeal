import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log("=== מצב טבלאות הלמידה (לפני השמירה) ===");
    const fvr = await prisma.fieldValueReliability.count();
    const cp = await prisma.contextPattern.count();
    const log = await prisma.parserLog.count();
    const thresh = await prisma.categoryFieldThreshold.count();
    
    console.log(`- FieldValueReliability (מילון מונחים משוקלל): ${fvr} רשומות`);
    console.log(`- ContextPattern (שושלות מילים - אבא/נכד): ${cp} רשומות`);
    console.log(`- CategoryFieldThreshold (ספי קבלת החלטות): ${thresh} רשומות`);
    console.log(`- ParserLog (היסטוריית תיקונים ותגובות לחוקר): ${log} רשומות`);
    
    if (fvr > 0) {
        const sample = await prisma.fieldValueReliability.findMany({ take: 3 });
        console.log("\nדוגמה למילים שכבר נלמדו:");
        sample.forEach(s => console.log(`  * ${s.field}: "${s.value}" (משקל: ${s.reliabilityScore})`));
    }
}

check().finally(() => prisma.$disconnect());
