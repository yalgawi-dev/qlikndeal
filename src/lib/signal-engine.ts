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
 *   - HARD_SIGNAL pre-DB layer (universal symbols) ✅  ← NEW
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

// ─────────────────────────────────────────────────────────────
// HARD_SIGNAL — Universal signals that ALWAYS fire (pre-DB)
// These bypass all dictionaries and anchor logic.
// Signal Lock: if detected → Crown War does NOT run for this token.
// ─────────────────────────────────────────────────────────────
const HARD_SIGNALS: Record<string, { field: string; confidence: number }> = {
  '₪':         { field: 'price',       confidence: 0.97 },
  '$':         { field: 'price',       confidence: 0.97 },
  '€':         { field: 'price',       confidence: 0.97 },
  'שקל':       { field: 'price',       confidence: 0.97 },
  'ש"ח':       { field: 'price',       confidence: 0.97 },
  'שח':        { field: 'price',       confidence: 0.95 },
  '°c':        { field: 'temperature', confidence: 0.97 },
  'מעלות':     { field: 'temperature', confidence: 0.95 },
  'km':        { field: 'mileage',     confidence: 0.97 },
  'ק"מ':       { field: 'mileage',     confidence: 0.97 },
  'קמ':        { field: 'mileage',     confidence: 0.95 },
  'm²':        { field: 'size',        confidence: 0.97 },
  'מ"ר':       { field: 'size',        confidence: 0.97 },
  'מטר רבוע':  { field: 'size',        confidence: 0.95 },
};

/**
 * Pre-DB hard signal scan + number binding.
 * Runs BEFORE DB signals. Finds "1500 ₪" → { field: price, value: "1500", confidence: 0.97 }
 * Returns empty array if no hard signals match in this text.
 */
export function extractHardSignals(normalizedText: string): SignalMatch[] {
  const matches: SignalMatch[] = [];
  const text = normalizedText.toLowerCase();

  for (const [unit, meta] of Object.entries(HARD_SIGNALS)) {
    const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Number BEFORE unit: "1500 ₪" or "1500₪"
    const numBeforeRegex = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${escapedUnit}(?:\\b|\\s|$)`, 'gi');
    // Number AFTER unit: "₪1500" or "מחיר: 1500"
    const numAfterRegex  = new RegExp(`${escapedUnit}\\s*(\\d+(?:[.,]\\d+)?)`, 'gi');

    let m;
    while ((m = numBeforeRegex.exec(text)) !== null) {
      matches.push({ field: meta.field, value: m[1].replace(',', '.'), confidence: meta.confidence, source: 'UNIT_BINDING' });
    }
    while ((m = numAfterRegex.exec(text)) !== null) {
      matches.push({ field: meta.field, value: m[1].replace(',', '.'), confidence: meta.confidence, source: 'UNIT_BINDING' });
    }

    // Standalone unit detection (no number) — lower confidence
    if (text.includes(unit.toLowerCase())) {
      matches.push({ field: meta.field, value: unit, confidence: meta.confidence * 0.6, source: 'SIGNAL' });
    }
  }

  // Deduplicate: keep highest confidence per field+value combination
  const seen = new Map<string, SignalMatch>();
  for (const m of matches) {
    const key = `${m.field}__${m.value}`;
    if (!seen.has(key) || m.confidence > seen.get(key)!.confidence) seen.set(key, m);
  }
  return Array.from(seen.values());
}

/**
 * DB-driven signal matching.
 * Lightweight — O(N) scan over pre-fetched signals, no additional DB queries.
 */
export function extractSignals(
  normalizedText: string,
  signals: FieldSignalRecord[]
): SignalMatch[] {
  const matches: SignalMatch[] = [];

  for (const signal of signals) {
    if (!signal.rawValue) continue;

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
 * Dynamic Number + Unit Binding from DB-stored UNIT signals.
 * Example: "16 gb", "16GB".
 */
export function bindNumbersToUnits(
  normalizedText: string,
  signals: FieldSignalRecord[]
): SignalMatch[] {
  const matches: SignalMatch[] = [];
  const unitSignals = signals.filter(s => s.signalType === "UNIT" && s.rawValue && s.rawValue.length > 0);

  if (unitSignals.length === 0) return matches;

  for (const sig of unitSignals) {
    const unit = sig.rawValue.toLowerCase();
    const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${escapedUnit}(?:\\b|\\s|$)`, 'gi');
    
    let match;
    while ((match = regex.exec(normalizedText)) !== null) {
      if (match[1]) {
        matches.push({
          field: sig.field,
          value: match[1],
          confidence: (sig.weight || 0.6) * 0.4, // Weak fallback (e.g., ~0.24) so it doesn't kill ContextAwareParser
          source: "UNIT_BINDING",
        });
      }
    }
  }

  return matches;
}
