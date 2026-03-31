import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

// בדיקה: מה fieldType של brand/family/subModel
const fields = await p.categoryFormStructure.findMany({
    where: { 
        category: "LAPTOPS",
        fieldId: { in: ["brand", "family", "subModel", "condition", "batteryHealth", "cpu"] }
    },
    select: { fieldId: true, fieldType: true, labelHera: true }
});
console.log("=== Field Types לפני תיקון ===");
fields.forEach(f => console.log(`  ${f.fieldId.padEnd(15)} → fieldType: "${f.fieldType}"  (${f.labelHera})`));

// FIX: brand, family, subModel → text (לא dropdown - יש אלפי ערכים אפשריים)
const textFields = ["brand", "family", "subModel"];
let fixed = 0;
for (const fieldId of textFields) {
    const r = await p.categoryFormStructure.updateMany({
        where: { category: "LAPTOPS", fieldId, fieldType: "select" },
        data: { fieldType: "text" }
    });
    if (r.count > 0) {
        console.log(`✅ Fixed ${fieldId} → text (was select)`);
        fixed++;
    } else {
        console.log(`⏭  ${fieldId} already text or not found`);
    }
}

// Apply same fix to ALL categories (not just LAPTOPS - generic!)
const allCats = await p.categoryFormStructure.findMany({
    where: { fieldId: { in: textFields } },
    select: { category: true, fieldId: true, fieldType: true },
    distinct: ["category", "fieldId"]
});
console.log("\n=== כל הקטגוריות שיש בהן brand/family/subModel ===");
for (const row of allCats) {
    if (row.fieldType === "select") {
        await p.categoryFormStructure.updateMany({
            where: { category: row.category, fieldId: row.fieldId },
            data: { fieldType: "text" }
        });
        console.log(`  ✅ Fixed ${row.category}.${row.fieldId} → text`);
        fixed++;
    } else {
        console.log(`  ⏭  ${row.category}.${row.fieldId} already "${row.fieldType}"`);
    }
}

console.log(`\nסה"כ תוקנו: ${fixed} שדות`);
await p.$disconnect();
