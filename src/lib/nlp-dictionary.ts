import prismadb from "@/lib/prismadb";
import { dbCache } from "@/lib/db-cache";
// @ts-ignore
import nlp from "compromise";


const CACHE_TTL_MS = 60 * 1000 * 30; // ⚡ 30 min - NLP lexicon is stable during a session
let cachedLexicon: Record<string, string[]> | null = null;
let lastFetchTime = 0;

/**
 * בונה את מילון ה-NLP של Compromise על בסיס 2 מקורות:
 * 1. טפסים דינמיים (CategoryFormStructure) - שדות והתגים שלהם
 * 2. פירות שנבצרו מלמידת מכונה (FieldValueReliability) - ערכים מהתאים
 */
export async function buildCompromiseLexicon() {
  const now = Date.now();
  if (cachedLexicon && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedLexicon;
  }

  const lexicon: Record<string, string[]> = {};

  // מקור 1: שדות הטפסים שאנחנו יודעים בוודאות מה הם
  try {
    const formFields = await dbCache.getOrFetch("nlp_fields", async () => {
        return prismadb.categoryFormStructure.findMany();
    });
    for (const field of formFields as any[]) {
      if (field.labelHera) {
        const cleanLabel = field.labelHera.toLowerCase().trim();
        const tag = `${field.fieldId}Field`; // e.g., 'ramField'
        lexicon[cleanLabel] = ['Field', tag];
      }
    }
  } catch (e) {
    console.error(`[NLP Dictionary] Failed to load form fields`, e);
  }

  // מקור 2: הפירות שנבצרו ע"י ה-AI (בוקה ממשפחות וקהילות)
  try {
    const reliableValues = await dbCache.getOrFetch("nlp_reliable", async () => {
        return prismadb.fieldValueReliability.findMany({
          where: { confidence: { gte: 0.5 }, isIgnored: false } // לוקחים ערכים עם ביטחון מינימלי סביר
        });
    });
    for (const record of reliableValues as any[]) {
      if (record.value && record.value.length > 1) {
        const cleanValue = record.value.toLowerCase().trim();
        const tag = `${record.field}Value`; // e.g., 'ramValue'
        lexicon[cleanValue] = ['Value', tag];
      }
    }
  } catch (e) {
    console.error(`[NLP Dictionary] Failed to load reliable values`, e);
  }

  cachedLexicon = lexicon;
  lastFetchTime = now;

  console.log(`[NLP Dictionary] Rebuilt lexicon with ${Object.keys(lexicon).length} terms.`);

  return lexicon;
}

let lastAppliedTime = 0;

/**
 * מפעיל את ה-Plugin על מופע ה-Compromise ומוחזר לשימוש באנליזה
 */
export async function getEnhancedNlp() {
  const lexicon = await buildCompromiseLexicon();
  
  if (lastAppliedTime !== lastFetchTime) {
      const plugin = { 
        words: lexicon 
      };
      
      // משדכים פעם אחת בלבד לפי Cache TTL כדי למנוע זליגת זיכרון והאטה
      nlp.plugin(plugin);
      lastAppliedTime = lastFetchTime;
  }
  
  return nlp;
}
