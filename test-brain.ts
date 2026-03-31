import { masterLearn } from "./src/lib/learning";
import { masterAnalyze } from "./src/lib/analyze";

async function runTest() {
console.log("--- שלב 1: למידה מגנרית ---");

// נלמד את המערכת 3 שדות שונים כדי לראות שהיא מזהה הכל
await masterLearn("המחיר הוא 500 שח", "price", "500", "cars");
await masterLearn("יצרן מאזדה במצב טוב", "brand", "מאזדה", "cars");
await masterLearn("צבע לבן פנינה", "color", "לבן", "cars");

console.log("הלמידה הושלמה.\n");

console.log("--- שלב 2: ניתוח הודעה חדשה ---");
const testText = "אני מוכר מאזדה בצבע לבן והמחיר הוא 500 שח";
const results = await masterAnalyze(testText, "cars");

console.log("הודעה לניתוח:", testText);
console.log("הצעות שנמצאו:");
console.table(results);
}

runTest().catch(console.error);
