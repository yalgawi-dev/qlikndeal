function getSimilarity(s1: string, s2: string) {
const a = s1.toLowerCase(), b = s2.toLowerCase();
const costs = [];
for (let i = 0; i <= a.length; i++) {
let lastValue = i;
for (let j = 0; j <= b.length; j++) {
if (i === 0) costs[j] = j;
else if (j > 0) {
let newValue = costs[j - 1];
if (a.charAt(i - 1) !== b.charAt(j - 1))
newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
costs[j - 1] = lastValue;
lastValue = newValue;
}
}
if (i > 0) costs[b.length] = lastValue;
}
return (Math.max(a.length, b.length) - costs[b.length]) / Math.max(a.length, b.length);
}

async function runTest(input: string) {
console.log("-----------------------------------------");
console.log("בדיקת צינור נתונים עבור: " + input);
console.log("-----------------------------------------");

// --- שכבה 1: NATURAL (זיהוי קטגוריה) ---
const laptopKeywords = ['מקבוק', 'לפטופ', 'מחשב נייד', 'macbook'];
const isLaptop = laptopKeywords.some(k => input.toLowerCase().includes(k));
console.log("📍 סיכום שכבה 1 (Natural):");
console.log("   תוצר: קטגוריה = " + (isLaptop ? "Laptop" : "Unknown"));
console.log("");

// --- שכבה 2: EXTRACTION (חילוץ נתונים קשיחים) ---
const priceMatch = input.match(/\d+00/);
const ramMatch = input.match(/(\d+)\s*(GB|ג'יגה)/i);
const modelMatch = input.match(/(M1|M2|M3|i5|i7|i9)/i);

console.log("📍 סיכום שכבה 2 (Extraction):");
console.log("   תוצר: מחיר משוער = " + (priceMatch ? priceMatch[0] : "לא נמצא"));
console.log("   תוצר: זיכרון משוער = " + (ramMatch ? ramMatch[0] : "לא נמצא"));
console.log("   תוצר: מעבד משוער = " + (modelMatch ? modelMatch[0] : "לא נמצא"));
console.log("");

// --- שכבה 3: FUZZY (ניסיון להתאים מילים לשדות) ---
const dbFields = ['Price', 'Memory', 'CPU', 'Model'];
const words = input.split(/[\s,]+/);

console.log("📍 סיכום שכבה 3 (Fuzzy Match):");
let foundAny = false;
words.forEach(word => {
    dbFields.forEach(field => {
        const score = getSimilarity(word, field);
        if (score > 0.4) {
            console.log("   תוצר: המילה '" + word + "' דומה לשדה " + field + " (ציון: " + score.toFixed(2) + ")");
            foundAny = true;
        }
    });
});
if (!foundAny) console.log("   תוצר: לא נמצאו התאמות ישירות לשדות ה-DB.");
console.log("");

console.log("-----------------------------------------");
console.log("✅ הבדיקה הסתיימה בהצלחה!");
console.log("-----------------------------------------");
}

// הרצת הבדיקה
const adText = "למכירה מקבוק פרו 14 אינץ, מעבד M2, זיכרון 16GB, מחיר 5500 שח";
runTest(adText);