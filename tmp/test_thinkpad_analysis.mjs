// סימולציה של לוגיקת החילוץ מ-analyze/route.ts על מודעת ThinkPad
const text = `מפלצת עבודה עם AI – Lenovo ThinkPad X1 Carbon Gen 13 (2025)
תיאור: למכירה מחשב הדגל של לנובו, הדגם הכי חדש בשוק! מיועד למתכנתים, מעצבים ומנהלים שצריכים כוח מקסימלי במארז קל במיוחד. המחשב מצויד במעבד ה-Core Ultra החדש עם מעבד AI ייעודי (NPU) שהופך כל פעולה למהירה פי 3.

מפרט טכני:

מעבד: Intel Core Ultra 7 258V (סדרת Aura)

זיכרון: 32GB LPDDR5x

אחסון: 1TB SSD NVMe Gen5

מסך: 14" OLED 2.8K Touch, 120Hz

משקל: רק 1.09 ק"ג!

מצב: חדש באריזה, עם אחריות יבואן רשמי ל-3 שנים.

מחיר: 8,500 ₪ (גמיש מעט לרציניים).`;

const regexExtracted = {};

// === PRICE ===
const priceMatch = text.match(/(?:מבקש|מחיר|מחירו|עולה|ב-?|₪|שח|ש"ח)\s*([\d,]+)/i)
    || text.match(/([\d,]+)\s*(?:₪|שח|ש"ח)/i);
if (priceMatch) regexExtracted.price = priceMatch[1].replace(/,/g, "");

// === BRAND ===
const KNOWN_BRANDS = ["Lenovo", "לנובו", "Dell", "HP", "Apple", "MacBook", "Samsung", "ASUS", "Acer", "MSI"];
for (const brand of KNOWN_BRANDS) {
    if (text.toLowerCase().includes(brand.toLowerCase())) {
        regexExtracted.brand = brand;
        break;
    }
}

// === CPU (IMPROVED) ===
const cpuStructuredMatch = text.match(/מעבד[:\s]+([^\n(,]{4,50})/i);
if (cpuStructuredMatch) {
    regexExtracted.cpu = cpuStructuredMatch[1].trim().replace(/\s*\([^)]*\)/, "").trim();
} else {
    const cpuMatch = text.match(/(?:Intel\s+Core\s+Ultra\s+\d+\s+\d+\w*|Intel\s+Core\s+[im]\d[\d-][\w-]*|AMD\s+Ryzen\s+\d+\s+\d+\w*|Apple\s+M\d+(?:\s+(?:Pro|Max|Ultra))?)/i);
    if (cpuMatch) regexExtracted.cpu = cpuMatch[0].trim();
}

// === RAM ===
const ramMatch = text.match(/(\d{1,3})\s*(?:GB|גיגה)?\s*RAM/i)
    || text.match(/(\d{1,3})\s*(?:GB|גיגה)?\s*זיכרון/i)
    || text.match(/זיכרון[:\s]*(\d{1,3})/i)
    || text.match(/RAM[:\s]*(\d{1,3})/i);
if (ramMatch) regexExtracted.ram = ramMatch[1] + "GB";

// === STORAGE ===
const storageCtx = text.match(/(\d{2,4})\s*(?:GB|TB|גיגה)\s*(?:SSD|HDD|NVMe)/i)
    || text.match(/(?:SSD|HDD|אחסון|NVMe)\s*(\d{2,4})\s*(?:GB|TB)/i);
const storageFallback = text.match(/(\d{2,4})\s*(?:GB)\s*(?:LPDDR|DDR)/i); // skip RAM-like
const storageMatch = storageCtx;
if (storageMatch) {
    const num = storageMatch[1];
    const isTB = /TB/i.test(storageMatch[0]);
    regexExtracted.storage = num + (isTB ? "TB" : "GB");
    // Try to match dropdown format
    const storageOptions = ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD"];
    const val = regexExtracted.storage;
    const matched = storageOptions.find(o => o.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(o.replace(" SSD","").toLowerCase()));
    if (matched) regexExtracted.storage = matched;
}

// === SCREEN (NEW) ===
const screenStructured = text.match(/מסך[:\s]+(\d{1,2}(?:\.\d)?)/i);
const screenInline = text.match(/(\d{1,2}(?:\.\d)?)\s*(?:"|אינץ|inch)(?:[\s]|OLED|LCD|IPS|AMOLED|Touch|$)/i);
const screenMatch = screenStructured || screenInline;
if (screenMatch) regexExtracted.screen = screenMatch[1] + '"';

// === BATTERY ===
const batteryMatch = text.match(/(?:סוללה|battery|בטרי|בריאות)[\s\S]{0,35}?(\d{2,3})\s*%/i);
if (batteryMatch) regexExtracted.batteryHealth = batteryMatch[1] + "%";

// === CONDITION ===
const condKeywords = { "חדש באריזה": "חדש באריזה", "חדש": "חדש", "כמו חדש": "כמו חדש", "משומש": "משומש" };
for (const [kw, cond] of Object.entries(condKeywords)) {
    if (text.toLowerCase().includes(kw.toLowerCase())) { regexExtracted.condition = cond; break; }
}

// === SUBMODEL (from text) ===
const modelMatch = text.match(/ThinkPad\s+[\w\s]+\d{1,2}\s*(?:\([^)]*\))?/i);
if (modelMatch) regexExtracted.subModel = modelMatch[0].trim();

console.log("=== תוצאות חילוץ ===");
const FORM_FIELDS = ["brand", "subModel", "cpu", "ram", "storage", "screen", "batteryHealth", "condition", "price"];
for (const f of FORM_FIELDS) {
    const val = regexExtracted[f];
    const status = val ? "✅" : "❌";
    console.log(`  ${status}  ${f.padEnd(15)} → ${val || "(לא זוהה)"}`);
}

const extra = Object.keys(regexExtracted).filter(k => !FORM_FIELDS.includes(k));
if (extra.length > 0) {
    console.log("\n⚠️  שדות שלא תואמים ל-formStructure (יופיעו כ'שדות חיצוניים'):");
    extra.forEach(k => console.log(`  - ${k}: ${regexExtracted[k]}`));
} else {
    console.log("\n✅ אין שדות חיצוניים מיותרים!");
}
