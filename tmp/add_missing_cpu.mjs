import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

// הוספת מעבדים חסרים לקטגוריית LAPTOPS
const missingCpus = [
    "Intel Core Ultra 7 258V",
    "Intel Core Ultra 5 226V",
    "Intel Core Ultra 9 288V",
];

let added = 0;
for (const cpu of missingCpus) {
    const exists = await p.formFieldOption.findFirst({
        where: { category: "LAPTOPS", fieldId: "cpu", value: cpu }
    });
    if (!exists) {
        await p.formFieldOption.create({
            data: { category: "LAPTOPS", fieldId: "cpu", value: cpu }
        });
        console.log(`✅ Added CPU: ${cpu}`);
        added++;
    } else {
        console.log(`⏭  Already exists: ${cpu}`);
    }
}

// הוספת חדש באריזה לcondition אם חסר
const conditionExists = await p.formFieldOption.findFirst({
    where: { category: "LAPTOPS", fieldId: "condition", value: "חדש באריזה" }
});
if (!conditionExists) {
    await p.formFieldOption.create({
        data: { category: "LAPTOPS", fieldId: "condition", value: "חדש באריזה" }
    });
    console.log("✅ Added condition: חדש באריזה");
}

console.log(`\nסה"כ נוספו: ${added} CPUs`);
await p.$disconnect();
