/**
 * ANCHOR_NOISE_BLOCKLIST — Shared constant
 * ─────────────────────────────────────────
 * Words that must NEVER become anchors AND must NEVER enter fields
 * via Zero-Shot guessing.
 *
 * Rule: An anchor must be UNIQUE to a field.
 * Generic descriptors, adjectives, and stop-words fail this test.
 *
 * Used by:
 *  - learning.ts → blocks registration as new anchors
 *  - analyze.ts  → blocks Zero-Shot zero results from entering fields
 */
export const ANCHOR_NOISE_BLOCKLIST = new Set<string>([
  // Hebrew stop words
  "ו", "של", "את", "או", "ב", "ל", "על", "עם", "מ", "כ", "ה", "זה", "זו", "אחד",
  "גם", "רק", "יש", "אין", "כן", "לא", "מאוד", "כל", "יותר", "הכי",
  // Generic product descriptors (appear near ANY type of value)
  "נייד", "מחשב", "מסך", "מקלדת", "עכבר", "טלפון", "פלאפון", "מכשיר",
  "מוצר", "פריט", "ציוד", "יחידה", "דגם", "סוג", "גרסה",
  "ישן", "חדש", "ומשמש", "משומש", "תקין", "עובד", "במצב", "מצב",
  "מוסמך", "מקורי", "אמיתי", "חינם", "בחינם", "ללא", "כולל",
  // ── Generic adjectives that cause cross-field hallucinations ──
  "מהיר", "מהירה", "מהירות",
  "אמין", "אמינה", "עוצמתי", "עוצמתית",
  "מצוין", "מצוינת", "מעולה", "נהדר", "נהדרת",
  "נפלא", "נפלאת", "מדהים", "מדהימה", "מגניב", "מגניבה",
  "איכותי", "איכותית", "שמור", "שמורה", "אחלה",
  "ישנה", "מותאם", "מותאמת", "אינטנסיבי",
  "חזק", "חזקה", "קל", "קלה", "עמיד", "עמידה",
  "עסקי", "עסקית", "מקצועי", "מקצועית", "אישי", "אישית",
  // Generic English descriptors
  "laptop", "computer", "screen", "keyboard", "mouse", "device",
  "model", "type", "version", "edition", "series", "unit",
  "new", "used", "old", "good", "great", "like", "with", "and", "or",
  "fast", "quick", "powerful", "slim", "light",
  // Punctuation artifacts
  "", "-", ":", ".", ","
]);
