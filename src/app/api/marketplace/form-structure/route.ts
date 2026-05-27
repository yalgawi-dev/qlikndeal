import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { dbCache } from "@/lib/db-cache";

export const dynamic = "force-dynamic";   // route uses request.url — cannot be statically rendered
export const revalidate = 0;              // ⚡ No ISR — full dynamic at runtime (DB calls per request)

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        // ⚡ מחיקת cache ישן של מבנה הטופס כדי לוודא שינויי fieldType/catalog נטענים מהדב מיד
        dbCache.clear(`form_struct_ui_${category}`);
        dbCache.clear(`form_options_catalog_${category}`);

        // מבנה הטופס ניתני לשינוי תכופי חייב להמשיך מהדב ישירות (no cache)
        const structure = await prismadb.categoryFormStructure.findMany({
            where: { category },
            orderBy: { order: "asc" }
        });

        // 2. שליפת רשימות ההזנה מה-DB המסורתי
        const manualOptions = await dbCache.getOrFetch(`form_options_ui_${category}`, () => {
             return prismadb.formFieldOption.findMany({
                 where: { category }
             });
        });

        // 3. ⚡ שליפת רשימות מהמילון הלומד של ה-AI (Zero-Shot Seeded + Crowd Taught)
        const learnedOptions = await dbCache.getOrFetch(`form_options_ai_${category}`, () => {
             return prismadb.fieldValueReliability.findMany({
                 where: { 
                     category, 
                     isIgnored: false,
                     OR: [
                         { confidence: { gte: 0.80 } },
                         { occurrenceCount: { gte: 2 } }
                     ]
                 },
                 orderBy: { occurrenceCount: "desc" }
             });
        });

        // סידור האופציות בתוך אובייקט לפי fieldId לנוחות ה-Frontend
        const options: Record<string, string[]> = {};
        
        manualOptions.forEach((opt: any) => {
            if (!options[opt.fieldId]) options[opt.fieldId] = [];
            options[opt.fieldId].push(opt.value);
        });

        // 4. שאיבת נתונים טהורים מהקטלוג הרשמי (גולד סטנדרט) לפי קטגוריה — ישיר מהדב ללא cache!
        const catalogMap: Record<string, string[]> = { brand: [], family: [], subModel: [] };
        try {
            if (category === "LAPTOPS") {
                const items = await prismadb.laptopCatalog.findMany({
                    select: { brand: true, series: true, modelName: true }
                });
                items.forEach((item: any) => {
                    if (item.brand && !catalogMap.brand.includes(item.brand)) catalogMap.brand.push(item.brand);
                    if (item.series && !catalogMap.family.includes(item.series)) catalogMap.family.push(item.series);
                    if (item.modelName && !catalogMap.subModel.includes(item.modelName)) catalogMap.subModel.push(item.modelName);
                });
            } else if (category === "DESKTOPS") {
                const items = await prismadb.brandDesktopCatalog.findMany({
                    select: { brand: true, series: true, modelName: true }
                });
                items.forEach((item: any) => {
                    if (item.brand && !catalogMap.brand.includes(item.brand)) catalogMap.brand.push(item.brand);
                    if (item.series && !catalogMap.family.includes(item.series)) catalogMap.family.push(item.series);
                    if (item.modelName && !catalogMap.subModel.includes(item.modelName)) catalogMap.subModel.push(item.modelName);
                });
            } else if (category === "AIO") {
                const items = await prismadb.aioCatalog.findMany({
                    select: { brand: true, series: true, modelName: true }
                });
                items.forEach((item: any) => {
                    if (item.brand && !catalogMap.brand.includes(item.brand)) catalogMap.brand.push(item.brand);
                    if (item.series && !catalogMap.family.includes(item.series)) catalogMap.family.push(item.series);
                    if (item.modelName && !catalogMap.subModel.includes(item.modelName)) catalogMap.subModel.push(item.modelName);
                });
            } else if (category === "PHONES" || category === "SMARTPHONES" || category === "MOBILES") {
                const items = await prismadb.mobileCatalog.findMany({
                    select: { brand: true, series: true, modelName: true }
                });
                items.forEach((item: any) => {
                    if (item.brand && !catalogMap.brand.includes(item.brand)) catalogMap.brand.push(item.brand);
                    if (item.series && !catalogMap.family.includes(item.series)) catalogMap.family.push(item.series);
                    if (item.modelName && !catalogMap.subModel.includes(item.modelName)) catalogMap.subModel.push(item.modelName);
                });
            } else if (category === "VEHICLES") {
                const items = await prismadb.vehicleCatalog.findMany({
                    select: { make: true, model: true }
                });
                items.forEach((item: any) => {
                    if (item.make && !catalogMap.brand.includes(item.make)) catalogMap.brand.push(item.make);
                    if (item.model && !catalogMap.subModel.includes(item.model)) catalogMap.subModel.push(item.model);
                });
            }
        } catch (e) { console.error("Could not fetch catalog options", e); }
        // Sort alphabetically for UX
        Object.keys(catalogMap).forEach(k => catalogMap[k].sort((a, b) => a.localeCompare(b)));

        // מיזוג מונחי ה-AI (מונע כפילויות Case-Insensitive)
        learnedOptions.forEach((opt: any) => {
            if (!options[opt.field]) options[opt.field] = [];
            
            const existingLowers = options[opt.field].map(v => String(v).toLowerCase());
            if (!existingLowers.includes(String(opt.value).toLowerCase())) {
                 // Convert '16gb' to '16GB' etc by attempting an uppercase format for known acronyms
                 let presentationValue = String(opt.value);
                 presentationValue = presentationValue.replace(/gb/ig, 'GB').replace(/tb/ig, 'TB').replace(/ssd/ig, 'SSD').replace(/hdd/ig, 'HDD');
                 options[opt.field].push(presentationValue);
            }
        });

        // מיזוג נתוני הקטלוג האבסולוטיים (יצרן, סדרה, דגם) לתוך options
        // שים לב: קטגוריות שונות משתמשות ב-fieldId שונים (subModel מול model)
        // לכן אנו בודקים מה קיים ב-formStructure ומוסיפים לפי השם האמיתי
        const subModelAliases = new Set(['submodel', 'model', 'subModel', 'model_name', 'modelname']);
        const structureFieldIds = new Set(structure.map((s: any) => s.fieldId.toLowerCase()));

        Object.keys(catalogMap).forEach(catalogKey => {
            // מצא את ה-fieldId האמיתי בטופס שמתאים למפתח זה
            let targetFieldId = catalogKey; // ברירת מחדל: השתמש במפתח כפי שהוא

            // אם זה subModel — מצא איך הטופס הזה מגדיר את שדה הדגם
            if (catalogKey === 'subModel') {
                if (structureFieldIds.has('submodel')) targetFieldId = 'subModel';
                else if (structureFieldIds.has('model')) targetFieldId = 'model';
                else if (structureFieldIds.has('model_name')) targetFieldId = 'model_name';
                // אם לא קיים בטופס — דלג
                if (!structureFieldIds.has(targetFieldId.toLowerCase())) return;
            }

            if (!options[targetFieldId]) options[targetFieldId] = [];
            catalogMap[catalogKey].forEach((catVal: string) => {
                const existingLowers = options[targetFieldId].map(v => String(v).toLowerCase());
                if (!existingLowers.includes(catVal.toLowerCase())) {
                    options[targetFieldId].push(catVal);
                }
            });
            // מיון אלפבתי
            options[targetFieldId].sort((a, b) => a.localeCompare(b));
        });

        // ⚡ Sort all option lists alphabetically (A-Z / א-ת) with numeric sorting support for premium UX
        Object.keys(options).forEach(fieldId => {
            options[fieldId].sort((a, b) => a.localeCompare(b, 'he', { sensitivity: 'base', numeric: true }));
        });

        return NextResponse.json({
            success: true,
            structure,
            options
        });

    } catch (error: any) {
        console.error("[FORM_STRUCTURE_GET] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    // אזהרה: לעולם לא להשתמש ב- prisma.$disconnect() בתוך Next.js Serverless Routes! הוא הורג את הפול ומייצר השהיות של 10 שניות לבא בתור.
}
