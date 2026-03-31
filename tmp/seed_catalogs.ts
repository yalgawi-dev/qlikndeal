import { PrismaClient } from '@prisma/client';
import { 
    LAPTOP_DATABASE, 
    RAM_OPTIONS,
    STORAGE_OPTIONS,
    CPU_OPTIONS,
    ComputerModelFamily
} from '../src/lib/computer-data';
import { 
    BRAND_DESKTOPS_DATABASE, 
    AIO_DATABASE 
} from '../src/lib/desktops-aio-data';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 מתחיל בהעברת קטלוג המחשבים למסד הנתונים!");

    // 1. העברת מותגי מחשבים ניידים (Laptops)
    for (const [brand, families] of Object.entries(LAPTOP_DATABASE)) {
        for (const familyObj of families) {
            const familyName = familyObj.name;
            for (const sub of familyObj.subModels) {
                await prisma.computerCatalog.createMany({
                    data: [{ brand, category: "LAPTOPS", family: familyName, modelName: sub.name, specs: JSON.stringify(sub), hebrewAliases: [] }],
                    skipDuplicates: true
                });
            }
        }
    }
    console.log("✅ קטלוג Laptops הועבר!");

    // 2. העברת Desktop & AIO
    for (const [brand, families] of Object.entries(BRAND_DESKTOPS_DATABASE)) {
        for (const familyObj of families) {
            const familyName = familyObj.name;
            for (const sub of familyObj.subModels) {
                await prisma.computerCatalog.createMany({
                    data: [{ brand, category: "DESKTOPS", family: familyName, modelName: sub.name, specs: JSON.stringify(sub), hebrewAliases: [] }],
                    skipDuplicates: true
                });
            }
        }
    }
    
    for (const [brand, families] of Object.entries(AIO_DATABASE)) {
        for (const familyObj of families) {
            const familyName = familyObj.name;
            for (const sub of familyObj.subModels) {
                await prisma.computerCatalog.createMany({
                    data: [{ brand, category: "AIO", family: familyName, modelName: sub.name, specs: JSON.stringify(sub), hebrewAliases: [] }],
                    skipDuplicates: true
                });
            }
        }
    }
    console.log("✅ קטלוג Desktops & AIO הועבר!");

    // 3. הגדרת שדות הטופס למחשבים ניידים ב-DB
    const laptopFields = [
        { fieldId: "brand", labelHera: "יצרן", fieldType: "select", order: 10, isRequired: true },
        { fieldId: "family", labelHera: "סדרת יצרן", fieldType: "select", order: 20 },
        { fieldId: "cpu", labelHera: "סדרת מעבד", fieldType: "select", order: 30, isRequired: true },
        { fieldId: "ram", labelHera: "זיכרון RAM", fieldType: "select", order: 40, isRequired: true },
        { fieldId: "storage", labelHera: "נפח אחסון", fieldType: "select", order: 50, isRequired: true },
        { fieldId: "os", labelHera: "מערכת הפעלה", fieldType: "select", order: 60 },
        { fieldId: "screen", labelHera: "גודל מסך", fieldType: "select", order: 70 },
        { fieldId: "gpu", labelHera: "כרטיס מסך", fieldType: "text", order: 80 }
    ];

    console.log("🚀 בונה שלד טפסים (CategoryFormStructure)...");
    for (const field of laptopFields) {
        await prisma.categoryFormStructure.upsert({
            where: { category_fieldId: { category: "LAPTOPS", fieldId: field.fieldId } },
            update: { ...field },
            create: { category: "LAPTOPS", ...field }
        });
    }

    // 4. הזנת האפשרויות השמרניות (RAM, Storage, CPU) אל ה-DB
    console.log("🚀 טוען אפשרויות (FieldOptions)...");
    
    // RAM
    for (const ram of RAM_OPTIONS) {
        await prisma.formFieldOption.upsert({
            where: { category_fieldId_value: { category: "LAPTOPS", fieldId: "ram", value: ram } },
            update: {}, create: { category: "LAPTOPS", fieldId: "ram", value: ram }
        });
    }
    
    // Storage
    for (const storage of STORAGE_OPTIONS) {
        await prisma.formFieldOption.upsert({
            where: { category_fieldId_value: { category: "LAPTOPS", fieldId: "storage", value: storage } },
            update: {}, create: { category: "LAPTOPS", fieldId: "storage", value: storage }
        });
    }

    // CPU Options (nested by Brand)
    for (const [cpuBrand, cpus] of Object.entries(CPU_OPTIONS)) {
        for (const cpu of cpus) {
            await prisma.formFieldOption.upsert({
                where: { category_fieldId_value: { category: "LAPTOPS", fieldId: "cpu", value: cpu } },
                update: {}, create: { category: "LAPTOPS", fieldId: "cpu", value: cpu }
            });
        }
    }

    console.log("✅ ההגירה הסתיימה בהצלחה! התשתית הדינמית ב-DB מוכנה לפעולה!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
