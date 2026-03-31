/**
 * ─────────────────────────────────────────────────────────────
 * Hebrew Normalizer — STEP 1 of the AI Extraction Pipeline
 * ─────────────────────────────────────────────────────────────
 *
 * Runs BEFORE any NLP (compromise) processing.
 * Handles:
 *   - Niqqud removal
 *   - Hebrew prefix stripping (ה, ל, ב, כ, ו, מ)
 *   - Plural normalization (basic morphology)
 *   - Unit standardization (גיגה → gb, אינץ → inch)
 *   - Punctuation cleanup
 */

// Unit normalization map — kept generic (no category-specific rules!)
const UNIT_NORMALIZATION: [RegExp, string][] = [
  // Storage / RAM
  [/גיגה(?:בייט)?|ג['׳]יגה|gb|ג"ב/gi, "gb"],
  [/טרה(?:בייט)?|tb|ט"ב/gi, "tb"],
  [/מגה(?:בייט)?|mb|מ"ב/gi, "mb"],

  // Display
  [/אינ(?:צ|ץ)|inch(?:es)?/gi, "inch"],

  // Frequency / Performance
  [/גיגה\s*הרץ|ghz/gi, "ghz"],
  [/מגה\s*הרץ|mhz/gi, "mhz"],
];

/**
 * Normalizes Hebrew text for downstream NLP and signal matching.
 * Safe to run on mixed Hebrew/English text.
 */
export function normalizeHebrew(text: string): string {
  if (!text) return "";

  let result = text
    // Lowercase everything
    .toLowerCase()

    // ─── Remove Niqqud (Hebrew vowel diacritics) ───
    .normalize("NFD")
    .replace(/[\u0591-\u05C7]/g, "")

    // ─── Strip common Hebrew prefixes before Hebrew letters ───
    // Matches: ה, ל, ב, כ, ו, מ, ש, from standalone form
    // Uses a word-boundary-like approach: prefix followed by a Hebrew letter
    .replace(/(?:^|\s)(ה|ל|ב|כ|ו|מ|ש)(?=[א-ת])/g, " ")

    // ─── Plural normalization (basic morphological heuristics) ───
    .replace(/ים\b/g, "")   // e.g. מחשבים → מחשב
    .replace(/ות\b/g, "")   // e.g. מצלמות → מצלמ

    // ─── Clean common punctuation ───
    .replace(/[,"'״׳]/g, "")
    .trim();

  // ─── Unit normalization (applied AFTER basic cleanup) ───
  for (const [pattern, replacement] of UNIT_NORMALIZATION) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * Lighter version for use in matcher/category-detection context:
 * Strips prefixes + niqqud but skips plural normalization.
 * Used in matcher-core.ts where aggressive morphology may hurt brand/model detection.
 */
export function normalizeHebrewLight(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/(?:^|\s)(ה|ל|ב|כ|ו|מ)(?=[א-ת])/g, " ")
    .replace(/[,"'״׳]/g, "")
    .trim();
}
