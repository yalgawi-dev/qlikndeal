import { ContextAwareParser } from "./contextAwareParser";

const text = `למכירה: מחשב נייד עוצמתי למפתחים – מודל 2024! 
מחשב נייד מושלם להרצת סביבות פיתוח מורכבות, ניהול פלטפורמות מסחר ובניית אפליקציות. המחשב במצב תצוגה, שמור בקפידה וללא שריטה.

מפרט טכני: מעבד 14 ליבות, זיכרון 32GB RAM, כונן 1TB SSD מהיר, מסך 15.6 אינץ'.
שנת ייצור: 2024
מחיר: 4,500 ש"ח (גמיש מעט לרציניים).

זמין לאיסוף מיידי, אפשרות לשילוח מהיר ומאובטח. שלחו הודעה לפרטים נוספים ותיאום.`;

ContextAwareParser.parse({
    category: "LAPTOPS",
    originalText: text,
    anchors: [
        { phrase: "מודל", relatedFields: ["submodel"], expectedDirection: "FORWARD" },
        { phrase: "מסך", relatedFields: ["screen"], expectedDirection: "FORWARD" },
        { phrase: "כרטיס מסך", relatedFields: ["gpu"] }
    ],
    safeValues: []
}).then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
