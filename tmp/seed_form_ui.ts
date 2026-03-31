import { PrismaClient } from '@prisma/client';
import { 
    RAM_OPTIONS,
    STORAGE_OPTIONS,
    CPU_OPTIONS,
    SCREEN_SIZE_OPTIONS,
    OS_OPTIONS
} from '../src/lib/computer-data';

// נתוני סמארטפונים
const MOBILE_STORAGE = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const MOBILE_RAM = ["4GB", "6GB", "8GB", "12GB", "16GB"];

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 מעדכן את מבנה מנוע ה-UI (Data-Driven Categories) יחד עם עיצוב לתוך ה-DB...");

    // 1. הגדרת שדות ה-UI למחשבים ניידים בלוח האם (LAPTOPS)
    const laptopFields = [
        { fieldId: "brand", labelHera: "יצרן", fieldType: "select", sectionName: "זיהוי יצרן (סדרה)", order: 10, isRequired: true, icon: null },
        { fieldId: "family", labelHera: "סדרת יצרן", fieldType: "select", sectionName: "זיהוי יצרן (סדרה)", order: 20, isRequired: false, icon: null },
        { fieldId: "subModel", labelHera: "דגם יצרן / מק״ט", fieldType: "select", sectionName: "זיהוי יצרן (סדרה)", order: 30, isRequired: false, icon: null },
        
        { fieldId: "cpu", labelHera: "מעבד (CPU)", fieldType: "select", sectionName: "מפרט טכני", order: 40, isRequired: true, icon: "Cpu" },
        { fieldId: "ram", labelHera: "זיכרון RAM", fieldType: "select", sectionName: "מפרט טכני", order: 50, isRequired: true, icon: "MemoryStick" },
        { fieldId: "storage", labelHera: "נפח אחסון", fieldType: "select", sectionName: "מפרט טכני", order: 60, isRequired: true, icon: "HardDrive" },
        { fieldId: "os", labelHera: "מערכת הפעלה", fieldType: "select", sectionName: "מפרט טכני", order: 70, isRequired: false, icon: "Monitor" },
        { fieldId: "screen", labelHera: "גודל מסך", fieldType: "select", sectionName: "מפרט טכני", order: 80, isRequired: false, icon: "Maximize2" },
        { fieldId: "gpu", labelHera: "כרטיס מסך (GPU)", fieldType: "select", sectionName: "מפרט טכני", order: 90, isRequired: false, icon: "Cpu" },
        
        { fieldId: "condition", labelHera: "מצב המחשב", fieldType: "select", sectionName: "מצב כללי", order: 100, isRequired: true, icon: "Settings" },
    ];

    for (const category of ["LAPTOPS", "DESKTOPS", "AIO", "CUSTOM_COMPUTERS"]) {
        // מחשב נייח/בנייה לא צריך מסך (אלא אם זה AIO)
        let specificFields = [...laptopFields];
        if (category === "DESKTOPS" || category === "CUSTOM_COMPUTERS") {
            specificFields = specificFields.filter(f => f.fieldId !== "screen");
        }

        for (const field of specificFields) {
            await prisma.categoryFormStructure.upsert({
                where: { category_fieldId: { category: category, fieldId: field.fieldId } },
                update: { ...field },
                create: { category: category, ...field }
            });
        }
    }

    // 2. הגדרת שדות ה-UI לסמארטפונים (SMARTPHONES)
    const mobileFields = [
        { fieldId: "brand", labelHera: "יצרן", fieldType: "select", sectionName: "זיהוי פרטי מכשיר", order: 10, isRequired: true, icon: null },
        { fieldId: "family", labelHera: "סדרה", fieldType: "select", sectionName: "זיהוי פרטי מכשיר", order: 20, isRequired: false, icon: null },
        { fieldId: "model", labelHera: "דגם", fieldType: "select", sectionName: "זיהוי פרטי מכשיר", order: 30, isRequired: true, icon: null },
        
        { fieldId: "storage", labelHera: "נפח אחסון", fieldType: "select", sectionName: "מפרט", order: 40, isRequired: true, icon: "HardDrive" },
        { fieldId: "ram", labelHera: "זיכרון RAM", fieldType: "select", sectionName: "מפרט", order: 50, isRequired: false, icon: "MemoryStick" },

        { fieldId: "condition", labelHera: "מצב המכשיר", fieldType: "select", sectionName: "מצב וסוללה", order: 60, isRequired: true, icon: null },
        { fieldId: "batteryHealth", labelHera: "בריאות סוללה (%)", fieldType: "number", sectionName: "מצב וסוללה", order: 70, isRequired: false, icon: null },
    ];

    for (const field of mobileFields) {
        await prisma.categoryFormStructure.upsert({
            where: { category_fieldId: { category: "SMARTPHONES", fieldId: field.fieldId } },
            update: { ...field },
            create: { category: "SMARTPHONES", ...field }
        });
    }

    console.log("🚀 טוען אפשרויות (FieldOptions) עבור SMARTPHONES...");
    for (const storage of MOBILE_STORAGE) {
        await prisma.formFieldOption.upsert({
            where: { category_fieldId_value: { category: "SMARTPHONES", fieldId: "storage", value: storage } },
            update: {}, create: { category: "SMARTPHONES", fieldId: "storage", value: storage }
        });
    }
    for (const ram of MOBILE_RAM) {
        await prisma.formFieldOption.upsert({
            where: { category_fieldId_value: { category: "SMARTPHONES", fieldId: "ram", value: ram } },
            update: {}, create: { category: "SMARTPHONES", fieldId: "ram", value: ram }
        });
    }

    console.log("🚀 טוען אפשרויות לכל המחשבים (RAM, CPU, STO, OS)...");
    const COMPUTER_CATEGORIES = ["LAPTOPS", "DESKTOPS", "AIO", "CUSTOM_COMPUTERS"];
    const FLAT_CPUS = [...CPU_OPTIONS.Intel, ...CPU_OPTIONS.AMD, ...CPU_OPTIONS.Apple];
    
    for (const cat of COMPUTER_CATEGORIES) {
        for (const r of RAM_OPTIONS) {
            await prisma.formFieldOption.upsert({ where: { category_fieldId_value: { category: cat, fieldId: "ram", value: r } }, update: {}, create: { category: cat, fieldId: "ram", value: r }});
        }
        for (const s of STORAGE_OPTIONS) {
            await prisma.formFieldOption.upsert({ where: { category_fieldId_value: { category: cat, fieldId: "storage", value: s } }, update: {}, create: { category: cat, fieldId: "storage", value: s }});
        }
        for (const c of FLAT_CPUS) {
            await prisma.formFieldOption.upsert({ where: { category_fieldId_value: { category: cat, fieldId: "cpu", value: c } }, update: {}, create: { category: cat, fieldId: "cpu", value: c }});
        }
        for (const o of OS_OPTIONS) {
            await prisma.formFieldOption.upsert({ where: { category_fieldId_value: { category: cat, fieldId: "os", value: o } }, update: {}, create: { category: cat, fieldId: "os", value: o }});
        }
        for (const sc of SCREEN_SIZE_OPTIONS) {
            await prisma.formFieldOption.upsert({ where: { category_fieldId_value: { category: cat, fieldId: "screen", value: sc } }, update: {}, create: { category: cat, fieldId: "screen", value: sc }});
        }
    }

    const CONDITIONS = ["חדש", "כמו חדש", "משומש (מצב טוב)", "משומש", "מחודש", "לחלקים"];
    console.log("🚀 טוען אפשרויות מצב...");
    for (const cat of ["LAPTOPS", "DESKTOPS", "AIO", "CUSTOM_COMPUTERS", "SMARTPHONES"]) {
        for (const cond of CONDITIONS) {
            await prisma.formFieldOption.upsert({
                where: { category_fieldId_value: { category: cat, fieldId: "condition", value: cond } },
                update: {}, create: { category: cat, fieldId: "condition", value: cond }
            });
        }
    }

    console.log("✅ הזרקת העיצוב (UI Metadata) הסתיימה בהצלחה ללפטופים ולטלפונים!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
