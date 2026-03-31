import { NextResponse } from "next/server";
import { expertFeedbackPipeline } from "@/lib/expert-pipeline";
import prismadb from "@/lib/prismadb";
import { dbCache } from "@/lib/db-cache";

/**
 * מפת הקטגוריות המלאה לפי ה-Schema שלך.
 */
const CATEGORY_MAP: Record<string, any> = {
    PHONES: {
        table: 'mobileCatalog',
        brandField: 'brand',
        modelField: 'modelName'
    },
    LAPTOPS: {
        table: 'laptopCatalog',
        brandField: 'brand',
        modelField: 'modelName'
    },
    DESKTOPS: [
        { table: 'brandDesktopCatalog', brandField: 'brand', modelField: 'modelName' },
        { table: 'aioCatalog', brandField: 'brand', modelField: 'modelName' },
        { table: 'customBuildCatalog', brandField: 'typicalCpu', modelField: 'typicalGpu' }
    ],
    MOTHERBOARDS: {
        table: 'motherboardCatalog',
        brandField: 'brand',
        modelField: 'model'
    },
    VEHICLES: {
        table: 'vehicleCatalog',
        brandField: 'make',
        modelField: 'model'
    }
};

export async function POST(req: Request) {
    const t0 = Date.now();
    console.log("🟢 REQUEST START");

    try {
        const body = await req.json().catch(() => ({}));
        console.log("📥 BODY PARSED:", Date.now() - t0, "ms");

        // 🛡️ הגנה קריטית: מוודאים ש-text הוא תמיד מחרוזת (String)
        const rawText = body.text;
        const text = typeof rawText === 'string' ? rawText : "";

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 });
        }

        // 1. ניתוח AI כולל קטגוריה ודאית מהטופס
        const t1 = Date.now();
        const aiResult = await expertFeedbackPipeline(text, body.category);
        const t2 = Date.now();
        console.log("🧠 PIPELINE DONE:", t2 - t1, "ms");

        // 2. נרמול קטגוריות - יישור קו יסודי
        let finalCategory = aiResult?.category?.toUpperCase() || "GENERAL";
        const normalizationRules: Record<string, string> = {
            "MOBILES": "PHONES", "MOBILE": "PHONES", "PHONE": "PHONES",
            "LAPTOP": "LAPTOPS",
            "COMPUTER": "DESKTOPS", "DESKTOP": "DESKTOPS", "PC": "DESKTOPS",
            "AIO": "AIO", "CUSTOM": "CUSTOM_DESKTOPS", "CUSTOM_DESKTOP": "CUSTOM_DESKTOPS",
            "MOTHERBOARD": "MOTHERBOARDS"
        };

        if (normalizationRules[finalCategory]) {
            finalCategory = normalizationRules[finalCategory];
        }

        // 3. חיפוש בקטלוג מקביל (Catalog Search Re-wiring for Speed)
        // במקום לבצע סריקות LIKE '%' עמוקות על כל המילים במסד הנתונים שחנקו את השרת, 
        // אנו נשען על המותג והדגם שה-AI מצא בשלב 1 באופן אלגנטי ומהיר פי 1000!
        let catalogData: any = {};
        const config = CATEGORY_MAP[finalCategory];

        if (config && aiResult?.brand) {
            const configs = Array.isArray(config) ? config : [config];
            
            for (const conf of configs) {
                const prismaTable = (prismadb as any)[conf.table];
                if (!prismaTable) continue;

                try {
                    // חיפוש חכם מה-RAM (dbCache) במקום פתיחת פול מסד נתונים לבא בתור
                    const brandKey = aiResult.brand.toLowerCase().trim();
                    const match = await dbCache.getOrFetch<any>(`catalog_${conf.table}_${brandKey}`, () => 
                        prismaTable.findFirst({
                            where: {
                                [conf.brandField]: { equals: aiResult.brand, mode: 'insensitive' }
                            }
                        })
                    );

                    if (match) {
                        catalogData = {
                            brand: match[conf.brandField] || match.brand,
                            model: match[conf.modelField] || match.modelName,
                            modelName: match[conf.modelField] || match.modelName,
                            isCatalogMatch: true,
                            sourceTable: conf.table
                        };
                        break;
                    }
                } catch (e) {
                    console.error(`Search failed in ${conf.table}:`, e);
                }
            }
        }

        // 4. ⚡ שכבת Regex חכמה — ממלאת שדות שה-AI המילוני עדיין לא למד
        const regexExtracted: any = {};

        // מחיר — תומך ב"מבקש", "₪", "שח", "ש\"ח"
        const priceMatch = text.match(/(?:מבקש|מחיר|מחירו|עולה|ב-?|₪|שח|ש"ח)\s*([\d,]+)/i)
            || text.match(/([\d,]+)\s*(?:₪|שח|ש"ח)/i);
        if (priceMatch) {
            regexExtracted.price = priceMatch[1].replace(/,/g, "");
        }

        // כותרת — חיפוש שם מוצר (מותג + דגם)
        const KNOWN_BRANDS = ["אייפון", "iPhone", "Samsung", "סמסונג", "Xiaomi", "שיאומי",
            "Lenovo", "לנובו", "Dell", "HP", "Apple", "MacBook", "מקבוק",
            "Google", "OnePlus", "Huawei", "Oppo", "Pixel"];
        let foundBrand = "";
        for (const brand of KNOWN_BRANDS) {
            if (text.toLowerCase().includes(brand.toLowerCase())) {
                foundBrand = brand;
                regexExtracted.brand = brand;
                break;
            }
        }

        // חילוץ כותרת אוטומטית מטקסט המודעה - יצירת כותרת יפה ותמציתית (לפי שם הקטגוריה + יצרן)
        let generatedTitle = `${finalCategory === 'LAPTOPS' ? 'לפטופ' : finalCategory === 'PHONES' ? 'סמארטפון' : 'מוצר'}`;
        if (foundBrand) generatedTitle += ` ${foundBrand}`;
        if (!foundBrand && catalogData.brand) generatedTitle += ` ${catalogData.brand}`;
        
        // נוסיף עוד מילת תיאור אם יש
        const titleWords = text.split(/\s+/).slice(0, 4);
        const niceWords = titleWords.filter((w: string) => !["למכירה", "מבקש", "חדש", "משומש", "עם", "כמו"].includes(w));
        if (niceWords.length > 0 && !generatedTitle.includes(niceWords[0])) {
            regexExtracted.title = `${generatedTitle} - ${niceWords.join(" ")}`;
        } else {
            regexExtracted.title = generatedTitle;
        }

        // Storage — context-aware: prefers numbers near SSD/דיסק/אחסון before falling back to first match
        const storageContextMatch = 
            text.match(/(\d{1,4})\s*(?:GB|TB|\u05d2\u05d9\u05d2\u05d4)\s*(?:SSD|HDD|\u05d3\u05d9\u05e1\u05e7|\u05d0\u05d7\u05e1\u05d5\u05df|NVMe)/i) ||  // 1TB SSD / 512GB SSD
            text.match(/(?:SSD|HDD|\u05d3\u05d9\u05e1\u05e7|\u05d0\u05d7\u05e1\u05d5\u05e3|NVMe)\s*(\d{1,4})\s*(?:GB|TB|\u05d2\u05d9\u05d2\u05d4)/i) ||    // SSD 512
            text.match(/\u05d0\u05d7\u05e1\u05d5\u05df[:\s]*(\d{1,4})\s*(?:GB|TB)/i);                              // אחסון: 1TB
        const storageFallback = text.match(/(\d{2,4})\s*(?:GB|TB|\u05d2\u05d9\u05d2\u05d4)/i);
        const storageMatch = storageContextMatch || storageFallback;
        if (storageMatch) {
            const num = storageMatch[1];
            const isTB = /TB/i.test(storageMatch[0]);
            const unit = isTB ? "TB" : "GB";
            const isHDD = /HDD/i.test(storageMatch[0]);
            regexExtracted.storage = num + unit + (isHDD ? " HDD" : " SSD"); // e.g. "1TB SSD" / "512GB SSD"
        }

        // RAM — supports: '32GB RAM', '32 גיגה זיכרון', 'זיכרון: 32', 'RAM: 32'
        const ramMatch = 
            text.match(/(\d{1,3})\s*(?:GB|גיגה)?\s*RAM/i) ||        // 32GB RAM
            text.match(/(\d{1,3})\s*(?:GB|גיגה)?\s*זיכרון/i) ||    // 16 גיגה זיכרון
            text.match(/זיכרון[:\s]*(\d{1,3})\s*(?:GB|גיגה)?/i) ||  // זיכרון: 32 גיגה
            text.match(/RAM[:\s]*(\d{1,3})\s*(?:GB|גיגה)?/i);        // RAM: 16
        if (ramMatch) regexExtracted.ram = ramMatch[1] + "GB";

        // מעבד (CPU) - קודם נסה לחלץ משורה מובנה ("מעבד: Intel Core...") — דורש נקודותיים
        const cpuStructuredMatch = text.match(/מעבד:\s*([^\n(,]{4,50})/i);
        if (cpuStructuredMatch) {
            regexExtracted.cpu = cpuStructuredMatch[1].trim().replace(/\s*\([^)]*\)/, "").trim();
        } else {
            const cpuMatch = text.match(/(?:Intel\s+Core\s+Ultra\s+\d+\s+\d+\w*|Intel\s+Core\s+[im]\d[\d-][\w-]*|AMD\s+Ryzen\s+\d+\s+\d+\w*|Apple\s+M\d+(?:\s+(?:Pro|Max|Ultra))?|Snapdragon\s+X[\w\s]*)/i) ||
                text.match(/(?:i[3579]-[\w]+|M[1234]\s+(?:Pro|Max|Ultra)?|Ryzen\s*[3579]\s*[\w]+|Core\s*Ultra\s*\d+)[^,\n]*/i);
            if (cpuMatch) regexExtracted.cpu = cpuMatch[0].trim();
        }

        // מצב סוללה — אחוזים. נאפשר מרחק של עד 35 תווים בין המילה לאחוז
        const batteryMatch = text.match(/(?:סוללה|battery|בטרי|בריאות)[\s\S]{0,35}?(\d{2,3})\s*%/i);
        if (batteryMatch) regexExtracted.batteryHealth = batteryMatch[1] + "%";

        // גודל מסך - מחפש '14"' או 'מסך: 14' או '14 אינץ'
        const screenStructured = text.match(/מסך[:\s]+(\d{1,2}(?:\.\d)?)/i);
        const screenInline = text.match(/(\d{1,2}(?:\.\d)?)\s*(?:"|\u05d0ינץ|inch)(?:[\s]|OLED|LCD|IPS|AMOLED|Touch|$)/i);
        const screenMatch = screenStructured || screenInline;
        if (screenMatch) regexExtracted.screen = screenMatch[1] + '"';

        // מצב מכשיר
        // מצב מכשיר - סדר הבדיקה חשוב (קודם חיפושים מורכבים כמו "כמו חדש")
        const conditionKeywords: Record<string, string> = {
            "כמו חדש": "כמו חדש", "like new": "כמו חדש",
            "חדש": "חדש", "new": "חדש",
            "מחודש": "מחודש", "refurb": "מחודש", "renewed": "מחודש",
            "משומש": "משומש", "used": "משומש"
        };
        for (const [kw, cond] of Object.entries(conditionKeywords)) {
            if (text.toLowerCase().includes(kw.toLowerCase())) {
                regexExtracted.condition = cond;
                break;
            }
        }

        // 5. תשובה סופית — Regex wins on price if AI is only SUGGEST-level
        // Find AI suggestion confidence for price
        const aiPriceSuggestion = aiResult.suggestions?.find((s: any) => s.field === 'price');
        const aiPriceIsHighConfidence = aiPriceSuggestion?.action === 'AUTO_FILL';

        const response = NextResponse.json({
            success: true,
            result: {
                ...regexExtracted,
                ...aiResult,
                // אל לדרוס שדות שכבר חולצו ב-regexExtracted:
                title: aiResult.title || regexExtracted.title || "",
                // Price: regex wins unless AI has AUTO_FILL confidence
                price: (aiPriceIsHighConfidence ? aiResult.price : null) || regexExtracted.price || aiResult.price || "",
                condition: aiResult.condition || regexExtracted.condition || "",
                // ✅ מיפוי שמות שדות ל-fieldId של ה-DB:
                batteryHealth: aiResult.batteryHealth || regexExtracted.batteryHealth || "", // batteryHealth = DB fieldId
                storage: aiResult.storage || regexExtracted.storage || "",
                ram: aiResult.ram || regexExtracted.ram || "",
                cpu: aiResult.cpu || regexExtracted.cpu || "",
                screen: aiResult.screen || regexExtracted.screen || "",
                brand: aiResult.brand || catalogData.brand || regexExtracted.brand || "",
                // subModel = DB fieldId (instead of modelName)
                subModel: aiResult.subModel || catalogData.model || catalogData.modelName || "",
                category: finalCategory,
                // לא להעביר שדות פנימיים (isCatalogMatch / sourceTable) לטופס
                suggestions: aiResult.suggestions
            }
        });

        const tEnd = Date.now();
        console.log("🏁 TOTAL API TIME:", tEnd - t0, "ms");
        
        return response;

    } catch (error: any) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}