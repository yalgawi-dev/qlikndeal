import { masterLearn } from "./learning";
import { masterAnalyze } from "./analyze";
import prismadb from "./prismadb";

async function runTest() {
console.log("--- מתחיל בדיקה של מערכת הלמידה הדו-שכבתית ---");
const category = "electronics";

console.log("1. למידה: 'המוצר עולה 500 שח'...");
await masterLearn("המוצר עולה 500 שח", "price", "500", category);

// בדיקת שכבה 1: תבניות
const pattern = await (prismadb as any).contextPattern.findFirst({
where: { patternPart: "price", type: "FIELD" }
});
console.log("-> שכבת תבניות (Confidence):", pattern?.confidence);

// בדיקת שכבה 2: אמינות מילה
const wordRel = await (prismadb as any).wordReliability.findFirst({
where: { word: "עולה", field: "price" }
});
console.log("-> שכבת אמינות מילה (Reliability):", wordRel?.confidence);

console.log("\n2. בדיקת זיהוי חכם למשפט חדש: 'המחשב עולה 4000 שח'");
const suggestions = await masterAnalyze("המחשב עולה 4000 שח", category);

if (suggestions.length > 0) {
console.log("בינגו! המערכת זיהתה ש:");
console.log("- שדה:", suggestions[0].field);
console.log("- ביטחון תבנית:", suggestions[0].confidence);
console.log("- סיבה:", suggestions[0].reason);
} else {
console.log("לא נמצאו הצעות.");
}

process.exit(0);
}

runTest();
