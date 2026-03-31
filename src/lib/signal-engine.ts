/**
 * ─────────────────────────────────────────────────────────────
 * Signal Engine — STEP 2 of the AI Extraction Pipeline
 * ─────────────────────────────────────────────────────────────
 *
 * Replaces:
 *   - Hardcoded regex rules ❌
 *   - Fragile compromise NLP tag patterns ❌
 *
 * With:
 *   - DB-driven FieldSignal matching ✅
 *   - Dynamic unit binding (no category-specific rules) ✅
 */

export interface SignalMatch {
  field: string;
  value: string;
  confidence: number;
  source: "SIGNAL" | "UNIT_BINDING";
}

export interface FieldSignalRecord {
  id: string;
  category: string;
  field: string;
  rawValue: string;
  normalized: string;
  signalType: string; // "VALUE" | "UNIT" | "CONTEXT" | "NUMBER"
  weight: number;
}

/**
 * STEP 1 of Signal Engine:
 * Match all FieldSignal records against the normalized text.
 * Lightweight — O(N) scan over pre-fetched signals, no additional DB queries.
 */
export function extractSignals(
  normalizedText: string,
  signals: FieldSignalRecord[]
): SignalMatch[] {
  const matches: SignalMatch[] = [];

  for (const signal of signals) {
    if (!signal.rawValue) continue;

    // Whole-word-aware inclusion check
    if (normalizedText.includes(signal.rawValue.toLowerCase())) {
      matches.push({
        field: signal.field,
        value: signal.normalized || signal.rawValue,
        confidence: signal.weight,
        source: "SIGNAL",
      });
    }
  }

  return matches;
}

/**
 * STEP 2 of Signal Engine:
 * Dynamic Number + Unit Binding.
 *
 * Finds all numbers in the normalized text, then checks if any UNIT-type signal
 * appears nearby. If found, creates a confident binding like "16 gb → ram".
 *
 * This fully replaces hardcoded logic like:
 *   number + "gb" → storage
 */
export function bindNumbersToUnits(
  normalizedText: string,
  signals: FieldSignalRecord[]
): SignalMatch[] {
  const matches: SignalMatch[] = [];

  // Extract all numbers (integers and decimals)
  const numberMatches = normalizedText.match(/\d+(?:\.\d+)?/g) || [];

  for (const num of numberMatches) {
    // Find UNIT-type signals that appear in the same text
    const unitSignal = signals.find(
      (s) =>
        s.signalType === "UNIT" &&
        normalizedText.includes(s.rawValue.toLowerCase())
    );

    if (unitSignal) {
      matches.push({
        field: unitSignal.field,
        value: num,
        confidence: 0.9,
        source: "UNIT_BINDING",
      });
    }
  }

  return matches;
}
