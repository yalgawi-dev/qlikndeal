import { NextResponse } from "next/server";
import { expertFeedbackPipeline } from "@/lib/expert-pipeline";
import prismadb from "@/lib/prismadb";
import { dbCache } from "@/lib/db-cache";
import { detectConditionFromText } from "@/lib/computer-data";

/**
 * מפת הקטגוריות המלאה לפי ה-Schema שלך.
 */
const CATEGORY_MAP: Record<string, any> = {
    SMARTPHONES: {
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
        let text = typeof rawText === 'string' ? rawText : "";
        
        // ⚡ ניקוי סימנים מסחריים מעכבי זיהוי (®, ™, ©)
        text = text.replace(/[\u00ae\u2122\u00a9]/g, ' ').replace(/[\u200b-\u200d\ufeff]/g, '');

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 });
        }

        // 1. ניתוח AI כולל קטגוריה ודאית מהטופס
        const t1 = Date.now();
        const aiResult = await expertFeedbackPipeline(text, body.category);
        const t2 = Date.now();
        console.log("🧠 PIPELINE DONE:", t2 - t1, "ms");

        // 2. נרמול קטגוריות - יישור קו יסודי
        // Prioritize the category detected by the AI pipeline (aiResult?.category) so that the form category dropdown 
        // will update to the correct category identified by the AI. Fall back to body.category if undetected.
        let rawCategory = aiResult?.category || body.category || "GENERAL";
        let finalCategory = rawCategory.toUpperCase();
        const normalizationRules: Record<string, string> = {
            "MOBILES": "SMARTPHONES", "MOBILE": "SMARTPHONES", "PHONE": "SMARTPHONES", "PHONES": "SMARTPHONES",
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
                            // הוסר: לא משלימים דגם עיוור (model) רק בגלל שמצאנו מותג. זה יצר הלוצינציות (ThinkPad X1).
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

        // מחיר — סדר הפטרנים: ספציפי → כללי
        // 1. "מחיר: 6500" / "מבקש 6500" / "מחירו 3000"
        // 2. "6500 ₪" / "6,500 ₪" / "6500 שח"
        // 3. "₪ 6500" / "₪6500"
        // 4. "ב-6500" / "ב 6500"  (זהיר: "ב-2024" הוא שנה, לא מחיר!)
        const pricePatterns = [
            /(?:מחיר|מחירו|מבקש|עולה|ב-?|תמורת)[:\s]*([\d,]{2,})/i,
            /([\d,]{2,})\s*(?:₪|\u20AA|שח|ש"ח|שקל|שקלים)/i,
            /(?:₪|\u20AA)\s*([\d,]{2,})/i,
            /(?:^|\n|\s)([\d]{3,})(?:\s*₪|\s*שח|\s*ש"ח|\s*שקל|,|\s|$)/m,
        ];
        let foundPrice = "";
        for (const pattern of pricePatterns) {
            const m = text.match(pattern);
            if (m) {
                foundPrice = m[1].replace(/,/g, "");
                const numVal = parseInt(foundPrice);
                // מנע טעות: שנים (2000-2099) לעולם לא יהיו מחיר (מנע המקרה "ב-2024" → price=2024)
                if (numVal >= 2000 && numVal <= 2099) { foundPrice = ""; continue; }
                // Sanity check: price should be reasonable (200 – 10,000,000)
                if (numVal >= 200 && numVal <= 10000000) {
                    // Check context before match (reject CPU/GPU model numbers like RTX 5060)
                    const matchIndex = m.index || 0;
                    const textBefore = text.substring(Math.max(0, matchIndex - 25), matchIndex).toLowerCase();
                    const isModelNumber = /rtx|gtx|rx|i\d|ryzen|geforce|radeon|intel|amd|core|snapdragon|m\d/i.test(textBefore);
                    const isExplicitPrice = /מחיר|מחירו|מבקש|עולה|ב-?|תמורת/i.test(textBefore);
                    
                    if (isModelNumber && !isExplicitPrice) {
                        foundPrice = "";
                        continue;
                    }
                    break;
                }
                foundPrice = "";
            }
        }
        if (foundPrice) regexExtracted.price = foundPrice;

        // Brand Extraction & Normalization
        const appleBrands = ["אייפון", "iphone", "apple", "אפל", "macbook", "מקבוק", "imac", "איימק", "ipad", "אייפד"];
        const isApple = appleBrands.some(k => text.toLowerCase().includes(k));
        
        let foundBrand = "";
        if (isApple) {
            foundBrand = "Apple";
        } else {
            const KNOWN_BRANDS = ["Samsung", "סמסונג", "Xiaomi", "שיאומי",
                "Lenovo", "לנובו", "Dell", "HP", "Google", "OnePlus", "Huawei", "Oppo", "Pixel", "Asus", "אזוס", "אסוס", "Gigabyte", "MSI", "Acer", "איסר", "אייסר"];
            for (const brand of KNOWN_BRANDS) {
                if (text.toLowerCase().includes(brand.toLowerCase())) {
                    foundBrand = brand;
                    break;
                }
            }
        }
        
        if (foundBrand) {
            regexExtracted.brand = foundBrand;
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

        // RAM — supports: '32GB RAM', '32 גיגה זיכרון', 'זיכרון: 32', 'RAM: 32', '32 ג'יגה ראם'
        const ramMatch = 
            text.match(/(\d{1,3})\s*(?:GB|ג'?יגה)?\s*(?:RAM|ראם)/i) ||        // 32GB RAM
            text.match(/(\d{1,3})\s*(?:GB|ג'?יגה)?\s*זיכרון/i) ||    // 16 גיגה זיכרון
            text.match(/זיכרון[:\s]*(\d{1,3})\s*(?:GB|ג'?יגה)?/i) ||  // זיכרון: 32 גיגה
            text.match(/(?:RAM|ראם)[:\s]*(\d{1,3})\s*(?:GB|ג'?יגה)?/i);        // RAM: 16
        if (ramMatch) regexExtracted.ram = ramMatch[1] + "GB";

        // מעבד (CPU) - קודם נסה לחלץ משורה מובנה ("מעבד: Intel Core...") — דורש נקודותיים
        const cpuStructuredMatch = text.match(/מעבד:\s*([^\n(,]{4,50})/i);
        if (cpuStructuredMatch) {
            regexExtracted.cpu = cpuStructuredMatch[1].trim().replace(/\s*\([^)]*\)/, "").trim();
        } else {
            // מעבד (CPU) — חילוץ מהטקסט בלבד. תוקן פילטר רחב לזיהוי 'מעבד i7'.
            const cpuStopChar = /[,.(\n\u05D0-\u05EA]/; // stop at: comma, period, paren, newline, Hebrew word
            const cpuMatch =
                text.match(/מעבד\s+(i\d|m\d|Ryzen\s\d+|Ultra\s\d+)/i) ||
                text.match(/Intel\s+Core\s+Ultra\s+\d+(?:\s+[A-Z0-9]{3,6})?(?=[,.(\s\n]|$)/i) ||
                text.match(/Intel\s+Core\s+[im]\d[\d-][\w-]*(?=-|\s|,|\.|$)/i) ||
                text.match(/AMD\s+Ryzen\s+\d+\s+[\w-]+(?=[,.(\s\n]|$)/i) ||
                text.match(/Apple\s+M\d+(?:\s+(?:Pro|Max|Ultra))?(?=[,.(\s\n]|$)/i) ||
                text.match(/Snapdragon\s+X\s*[\w]+(?=[,.(\s\n]|$)/i) ||
                text.match(/\b(i3|i5|i7|i9|m[1-5](?:\s+(?:Pro|Max|Ultra))?|Ryzen\s*[3579])\b/i);
            if (cpuMatch) regexExtracted.cpu = cpuMatch[1] || cpuMatch[0].trim().replace(/\s+/g, ' ');
        }

        // כרטיס מסך (GPU) — Regex ייעודי כגיבוי
        const gpuMatch = 
            text.match(/(?:NVIDIA\s+)?GeForce\s+RTX\s+\d{3,4}(?:\s*Ti)?/i) ||
            text.match(/(?:NVIDIA\s+)?GeForce\s+GTX\s+\d{3,4}(?:\s*Ti)?/i) ||
            text.match(/(?:AMD\s+)?Radeon\s+RX\s+\d{3,4}(?:\s*XT)?/i) ||
            text.match(/(?:Intel\s+)?Iris\s+Xe\s*(?:Graphics)?/i) ||
            text.match(/(?:Intel\s+)?UHD\s+Graphics\s*\d{0,4}/i) ||
            text.match(/\b(RTX\s*A?\d{3,4}(?:\s*Ada)?|GTX\s*\d{3,4})\b/i) ||
            text.match(/(?:\bApple\s+)?\b(?:\d{1,2}-?Core|\d{1,2}c)\s+gpu\b/i);
        if (gpuMatch) regexExtracted.gpu = gpuMatch[0].trim().replace(/\s+/g, ' ');


        // מצב סוללה — אחוזים (תומך גם בסמל % וגם במילה 'אחוז'). נאפשר מרחק תווים למילים כמו "בטריה נמצאת ב 98 אחוז".
        const batteryMatch = text.match(/(?:סוללה|battery|בטרי|בריאות)[\s\S]{0,35}?(\d{2,3})\s*(?:%|אחוז)/i);
        if (batteryMatch) regexExtracted.batteryHealth = batteryMatch[1] + "%";

        // גודל מסך — מבדיל בין כל פורמטי האינץ:
        //   '14"'  / '14 אינץ\'' / '14 אינץ' / '14 inch' / 'מסך: 14'
        const screenStructured = text.match(/מסך[:\s]+(\d{1,2}(?:\.\d)?)/i);
        // טיפול בגרש אחרי אינץ: (?:['\'\u05f3]?) = אופציונלי מבלי דרשת
        const screenInline = text.match(/(\d{1,2}(?:\.\d)?)\s*(?:"|\u05d0ינץ['\'\u05f3]?|\u05d0ינצ['\'\u05f3]?|inch)(?=[^0-9]|$)/i);
        const screenMatch = screenStructured || screenInline;
        if (screenMatch) regexExtracted.screen = screenMatch[1] + '"';

        // סוג פאנל — OLED / QLED / IPS / LCD / AMOLED
        // זה לא פלסטר: זה בתנאי עד ש-Signal Engine ילמד על סוגי פאנלים דרך תיקוני משתמש.
        // לאחר שדאטה יתמלא ב-FieldSignal, שעה זו תוסר אוטומטית — אבל טרם, היא הבסיסלכך.
        const panelTypeMatch = text.match(/\b(OLED|QLED|AMOLED|Super\s*AMOLED|IPS|TN|VA|NANO\s*IPS|Mini\s*LED)\b/i);
        if (panelTypeMatch) regexExtracted.screenType = panelTypeMatch[1].toUpperCase().replace(/\s+/g, ' ');

        // מק"ט / SKU — חילוץ מספר מוצר/קטלוג מהטקסט
        // מזהה: 'המק"ט שלו זה DT-ASU-ROG-423' | 'sku: ABC-123' | 'מספר מוצר XYZ-456'
        // [^\u05d0-\u05ea]{0,25} = עד 25 תווים שאינם עברית בין הטריגר לערך (מכסה "שלו זה" וכו')
        const skuRawMatch = text.match(
            /(?:מק['"״]?ט|sku|מספר\s*(?:מוצר|דגם|קטלוג(?:י)?)|מקט|serial\s*number)[^\u05d0-\u05ea]{0,25}([A-Z0-9][A-Z0-9\-_.\/]{2,30})/i
        );
        if (skuRawMatch) regexExtracted.sku = skuRawMatch[1].toUpperCase();

        // מערכת הפעלה (OS) — Regex ייעודי: מבטיח זיהוי גם אם ה-AI לא לומד מספיק מהר
        // רץ מהספציפי לכללי (Windows 11 Home לפני Windows 11)
        if (!regexExtracted.os) {
            const osPatterns: { r: RegExp; val: string }[] = [
                { r: /windows\s*11\s*home/i,            val: "Windows 11 Home" },
                { r: /windows\s*11\s*pro/i,             val: "Windows 11 Pro" },
                { r: /windows\s*11/i,                   val: "Windows 11" },
                { r: /windows\s*10\s*home/i,            val: "Windows 10 Home" },
                { r: /windows\s*10\s*pro/i,             val: "Windows 10 Pro" },
                { r: /windows\s*10/i,                   val: "Windows 10" },
                { r: /mac\s*os|macos/i,                 val: "macOS" },
                { r: /ubuntu|debian|fedora|linux/i,     val: "Linux" },
                { r: /ללא\s*מערכת\s*הפעלה|dos\b/i,    val: "ללא מערכת הפעלה" },
            ];
            for (const { r, val } of osPatterns) {
                if (r.test(text)) { regexExtracted.os = val; break; }
            }
        }

        // סוג רזולוציה — FHD / QHD / UHD / 4.5K / 5K
        const resolutionMatch = text.match(/\b(4\.5K|5K|4K|2K|FHD|QHD|UHD|Retina)\b/i);
        if (resolutionMatch) {
            regexExtracted.resolutionType = resolutionMatch[1].toUpperCase();
        }

        // צבע (Color)
        const colorPatterns = [
            /\b(green|blue|pink|silver|space\s*gray|yellow|orange|purple|white|black)\b/i,
            /\b(ירוק|כחול|ורוד|כסף|אפור|צהוב|כתום|סגול|לבן|שחור)\b/
        ];
        let foundColor = "";
        for (const pattern of colorPatterns) {
            const m = text.match(pattern);
            if (m) {
                foundColor = m[1].toLowerCase();
                break;
            }
        }
        if (foundColor) {
            const colorMap: Record<string, string> = {
                "green": "ירוק (Green)", "ירוק": "ירוק (Green)",
                "blue": "כחול (Blue)", "כחול": "כחול (Blue)",
                "pink": "ורוד (Pink)", "ורוד": "ורוד (Pink)",
                "silver": "כסף (Silver)", "כסף": "כסף (Silver)",
                "space gray": "אפור חלל (Space Gray)", "spacegray": "אפור חלל (Space Gray)", "אפור": "אפור חלל (Space Gray)",
                "yellow": "צהוב (Yellow)", "צהוב": "צהוב (Yellow)",
                "orange": "כתום (Orange)", "כתום": "כתום (Orange)",
                "purple": "סגול (Purple)", "סגול": "סגול (Purple)",
                "white": "לבן", "לבן": "לבן",
                "black": "שחור", "שחור": "שחור"
            };
            regexExtracted.color = colorMap[foundColor] || foundColor;
        }

        // שנת יציאה / שנת השקה (releaseYear)
        const releaseYearMatch = text.match(/\b(20\d{2})\b/);
        if (releaseYearMatch) {
            const yr = parseInt(releaseYearMatch[1]);
            if (yr >= 2010 && yr <= 2030) {
                regexExtracted.releaseYear = String(yr);
            }
        }

        // Apple SKU / Model Number (e.g. MWUE3HB/A) mapped directly to subModel
        const appleSkuMatch = text.match(/\b([A-Z0-9]{5,10}\/[A-Z])\b/i);
        if (appleSkuMatch) {
            regexExtracted.subModel = appleSkuMatch[1].toUpperCase();
        }

        // מסך מגע (Touchscreen)
        const hasTouchNegation = /(?:ללא|בלי)\s+מסך\s+מגע/i.test(text) || /no\s+touch/i.test(text);
        const touchHebrewPattern = /(?:^|[\s,.-])(?:ב|ו|ל|מ)?(?:מסך\s*מגע|מגע)(?:$|[\s,.-])/i;
        const touchEnglishPattern = /\b(touch|touchscreen|touch\s*screen)\b/i;
        const hasTouch = touchHebrewPattern.test(text) || touchEnglishPattern.test(text);
        if (hasTouchNegation) {
            regexExtracted.touchscreen = "לא";
        } else if (hasTouch) {
            regexExtracted.touchscreen = "כן";
        }

        // גודל מסך משם הדגם (G16→16", X14→14") — כאשר לא נמצא ממפרט מפורש
        // לוגיקה: שם דגם שמסתיים בשתי ספרות בטווח 13-18 = כנראה גודל המסך באינץ'
        if (!regexExtracted.screen) {
            const modelTokens = text.match(/\b[A-Z][A-Z0-9]*(\d{2})\b/g) || [];
            for (const token of modelTokens) {
                const d = /(\d{2})$/.exec(token);
                if (d) {
                    const sz = parseInt(d[1]);
                    if (sz >= 13 && sz <= 18) { regexExtracted.screen = sz + '"'; break; }
                }
            }
        }

        // מצב מכשיר - זיהוי סמכותי וקנוני באמצעות detectConditionFromText
        // זה מונע באגים של includes() שבהם "חדש" מחליף "כמו חדש"
        regexExtracted.condition = detectConditionFromText(text);

        // 5. תשובה סופית — Regex wins on price if AI is only SUGGEST-level
        // Find AI suggestion confidence for price (it lives inside suggestions[], not as a top-level key)
        const priceSuggestion = (aiResult.suggestions || []).find((s: any) =>
            s.field === 'price' || s.field === 'מחיר'
        );
        const aiPriceValue = priceSuggestion?.value ? String(priceSuggestion.value) : "";
        const aiPriceIsHighConfidence = priceSuggestion?.action === 'AUTO_FILL';
        // Final winner: HIGH confidence AI > Regex > LOW confidence AI
        const finalPrice = (aiPriceIsHighConfidence && aiPriceValue)
            ? aiPriceValue
            : (regexExtracted.price || aiPriceValue || "");

        const response = NextResponse.json({
            success: true,
            result: {
                ...regexExtracted,
                ...aiResult,
                // אל לדרוס שדות שכבר חולצו ב-regexExtracted:
                title: aiResult.title || regexExtracted.title || "",
                // Price: finalPrice already resolves: HIGH-confidence AI > Regex > LOW-confidence AI
                price: finalPrice,
                // Condition: Regex is strictly ordered (longest to shortest) so it prevents "חדש" from crushing "כמו חדש"
                condition: regexExtracted.condition || aiResult.condition || "",
                // ✅ מיפוי שמות שדות ל-fieldId של ה-DB:
                batteryHealth: aiResult.batteryHealth || regexExtracted.batteryHealth || "", // batteryHealth = DB fieldId
                storage: aiResult.storage || regexExtracted.storage || "",
                ram: aiResult.ram || regexExtracted.ram || "",
                cpu: aiResult.cpu || regexExtracted.cpu || "",
                screen: aiResult.screen || regexExtracted.screen || "",
                brand: aiResult.brand || catalogData.brand || regexExtracted.brand || "",
                // subModel = DB fieldId
                subModel: aiResult.subModel || regexExtracted.subModel || "",
                category: finalCategory,
                gpu: aiResult.gpu || regexExtracted.gpu || "",
                // שדות חדשים
                refreshRate: regexExtracted.refreshRate || aiResult.refreshRate || "",
                resolutionType: regexExtracted.resolutionType || aiResult.resolutionType || "",
                extraStorage: regexExtracted.extraStorage || aiResult.extraStorage || "",
                color: aiResult.color || regexExtracted.color || "",
                releaseYear: aiResult.releaseYear || regexExtracted.releaseYear || "",
                touchscreen: aiResult.touchscreen || regexExtracted.touchscreen || "",
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