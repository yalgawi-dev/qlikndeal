import prismadb from "./prismadb";
import { dbCache } from "./db-cache";
import { revalidateTag } from "next/cache";
import { ANCHOR_NOISE_BLOCKLIST } from "./constants/anchor-blocklist";

/**
 * ענישה (Penalty) - מוריד משקלים כשה-AI טועה
 * נקרא כשמשתמש: (1) לוחץ X על הצעה, (2) משנה ערך שה-AI הציע
 * 
 * @param field   - שם השדה שטעה (למשל "condition")
 * @param wrongValue - הערך השגוי שה-AI הציע (למשל "חדש")
 * @param category   - קטגוריה (למשל "LAPTOPS")
 */
export async function masterPenalize(field: string, wrongValue: string, category: string) {
  if (!field || !wrongValue || !category) return { penalized: 0 };
  
  const cleanValue = String(wrongValue).toLowerCase().trim();
  if (cleanValue.length < 1) return { penalized: 0 };
  
  let penalized = 0;
  // Massive penalty for explicit rejection
  const PENALTY_DICT      = 0.50;  // 50% drop!
  const PENALTY_SIGNAL    = 0.50;  // 50% drop!
  const PENALTY_ANCHOR    = 0.30;  // 30% drop for anchors to quickly sever bad links
  const MIN_CONFIDENCE    = 0.0;
  const PRUNE_THRESHOLD   = 0.3;   // Ignore values dropping below 30% after an explicit penalty

  // 1. ענישה ב-FieldValueReliability (המילון)
  try {
    const dictEntry = await (prismadb as any).fieldValueReliability.findFirst({
      where: { value: cleanValue, field, category }
    });
    if (dictEntry) {
      const newConf = Math.max(MIN_CONFIDENCE, dictEntry.confidence - PENALTY_DICT);
      const shouldIgnore = newConf < PRUNE_THRESHOLD || dictEntry.isIgnored;
      await (prismadb as any).fieldValueReliability.update({
        where: { id: dictEntry.id },
        data: { confidence: newConf, isIgnored: shouldIgnore }
      });
      penalized++;
      if (shouldIgnore) console.log(`👑 [Crown War] "${cleanValue}" for ${field} was PRUNED (Retired) in Dictionary.`);
    }
  } catch(e) { /* non-critical */ }

  // 2. ענישה ב-FieldSignal (הסיגנל הישיר)
  try {
    const signal = await (prismadb as any).fieldSignal.findFirst({
      where: { rawValue: cleanValue, field, category }
    });
    if (signal) {
      const newWeight = Math.max(MIN_CONFIDENCE, Number(signal.weight) - PENALTY_SIGNAL);
      const shouldIgnore = newWeight < PRUNE_THRESHOLD || signal.isIgnored;
      await (prismadb as any).fieldSignal.update({
        where: { id: signal.id },
        data: { weight: newWeight, isIgnored: shouldIgnore }
      });
      penalized++;
      if (shouldIgnore) console.log(`👑 [Crown War] "${cleanValue}" for ${field} was PRUNED (Retired) in Signals.`);
    }
  } catch(e) { /* non-critical */ }

  // 3. Parasite Decay ב-FieldAnchor — per-field, לא מחיקה גלובלית!
  // עוגן שמצביע גם על שדה שגוי → ה-confidence של אותו שדה ספציפי יורד.
  // עוגן שמצביע גם על שדות אחרים → נשאר חי לחלוטין עבורם.
  try {
    const wrongAnchors = await (prismadb as any).fieldAnchor.findMany({
      where: { category, relatedFields: { has: field } }
    });
    for (const anchor of wrongAnchors) {
      const existingFC = (anchor.fieldConfidences as Record<string, number>) || {};
      const oldFieldConf = existingFC[field] ?? (anchor.confidence || 0.5);

      // Asymptotic decay: newConf = old × 0.75 (25% cut per explicit penalty)
      const newFieldConf = Math.max(0.0, oldFieldConf * 0.75);
      const updatedFC    = { ...existingFC, [field]: newFieldConf };

      // אם ה-confidence לשדה הזה ירד מאוד → מסירים אותו מ-relatedFields (מת ולא טפיל!)
      const FIELD_PRUNE_THRESHOLD = 0.08;
      const shouldPruneField = newFieldConf < FIELD_PRUNE_THRESHOLD;
      const updatedRelatedFields = shouldPruneField
        ? anchor.relatedFields.filter((f: string) => f !== field)
        : anchor.relatedFields;

      // עוגן שנשאר ריק לחלוטין → Ignore
      const shouldIgnoreAnchor = updatedRelatedFields.length === 0;

      await (prismadb as any).fieldAnchor.update({
        where: { id: anchor.id },
        data: {
          fieldConfidences:  updatedFC,
          relatedFields:     updatedRelatedFields,
          isIgnored:         shouldIgnoreAnchor ? true : anchor.isIgnored,
        }
      });
      penalized++;

      if (shouldPruneField) {
        console.log(`🧹 [Parasite Pruned] anchor "${anchor.phrase}" → [${field}] conf dropped to ${newFieldConf.toFixed(3)} → removed`);
      }
    }
  } catch(e) { /* non-critical */ }

  // שחרר קאש כדי שהענישה תשפיע מיד בלי עיכוב 60 שניות!
  dbCache.clear(`ai_reliable_vals_${category}`);
  dbCache.clear(`ai_anchors_${category}`);
  dbCache.clear(`ai_alias_${category}`);
  try { revalidateTag(`db_cache_ai_reliable_vals_${category}`); } catch(e) {}
  try { revalidateTag(`db_cache_ai_anchors_${category}`); } catch(e) {}

  return { penalized, field, wrongValue };
}

/**
 * למידה מתוך נתונים מובנים (ייבוא קטלוג)
 */
export async function learnFromImport(field: string, value: any, category: string) {
  if (!value) return;

  // ─── CANONICAL FIELD NAME GATE (Safety net) ────────────────────────────────
  // Same map as masterLearn + catalog-specific aliases.
  // Ensures FVR is NEVER contaminated with legacy names regardless of caller.
  const CANONICAL: Record<string, string | null> = {
    'series':        'family',
    'modelName':     'subModel',
    'model':         'subModel',
    'screenSize':    'screen',
    'display':       'display',
    'rearCamera':    'cameraMain',
    'frontCamera':   'cameraSystem',
    'make':          'brand',
    'release_year':  'releaseYear',
    'battery_health':'batteryHealth',
    'screen_type':   'screenType',
    'categoryType':  'type',
    'title':         null,   // ghost field — never store
  };
  if (CANONICAL.hasOwnProperty(field)) {
    const mapped = CANONICAL[field];
    if (!mapped) return; // ghost field blocked
    field = mapped;
  }
  // ─────────────────────────────────────────────────────────────────────────────

  const values = Array.isArray(value) ? value : [value];

  for (const v of values) {
    const cleanValue = String(v).toLowerCase().trim();
    if (cleanValue.length < 2) continue;

    try {
      // Read existing first for asymptotic growth (prevents confidence > 1.0)
      const existing = await (prismadb as any).fieldValueReliability.findFirst({
        where: { value: cleanValue, field, category }
      });

      if (existing) {
        const oldConf = Number(existing.confidence) || 0.9;
        const newConf = Math.min(0.99, oldConf + (1 - oldConf) * 0.01); // asymptotic: tiny step toward 1.0
        await (prismadb as any).fieldValueReliability.update({
          where: { id: existing.id },
          data: { occurrenceCount: { increment: 1 }, confidence: newConf }
        });
      } else {
        // ─── VIP GUARD (Exclusive Field Protection) ─────────────────────
        const VIP_SUPREMACY_THRESHOLD = 0.65;
        const existingOtherFieldCandle = await (prismadb as any).fieldValueReliability.findFirst({
            where: { 
                value: cleanValue, 
                category,
                field: { not: field },
                isIgnored: false,
                confidence: { gte: VIP_SUPREMACY_THRESHOLD }
            }
        });

        if (existingOtherFieldCandle) {
            console.log(`🛡️ [VIP Guard - Import] BLOCKED learning "${cleanValue}" for field [${field}] because it is already a locked VIP for [${existingOtherFieldCandle.field}]!`);
            continue; // Skip this value, do not insert into DB
        }
        // ─────────────────────────────────────────────────────────────────

        await (prismadb as any).fieldValueReliability.create({
          data: {
            value: cleanValue,
            field,
            category,
            confidence: 0.90,   // catalog values start with HIGH confidence
            occurrenceCount: 1
          }
        });
      }
    } catch (e) {
      console.error("Dictionary update failed:", e);
    }
  }
}

/**
 * למידה מטקסט חופשי (מתוך תיאור המודעה)
 */
export async function masterLearn(text: string, field: string, value: string, category: string) {
  // ─── CANONICAL FIELD NAME GATE ──────────────────────────────────────────────
  // ARCHITECTURE RULE: masterLearn is the ONLY entry point for learning.
  // Normalize field name → form fieldId HERE, before any storage.
  // This ensures that regardless of the caller (form, catalog, API, admin),
  // candles are ALWAYS stored under the canonical form fieldId.
  // e.g.: "series" → "family", "SKU" → "sku", "שנת דגם" → "releaseYear"
  // ─────────────────────────────────────────────────────────────────────────────
  const CANONICAL_FIELD_MAP: Record<string, string> = {
    'series':             'family',
    'display':            'display',
    'מפרט מסך':          'display',
    'תצוגה':             'display',
    'screenSize':         'screen',
    'screen size':        'screen',
    'גודל מסך':        'screen',
    'מסך':               'screen',
    'BatteryStatus':      'batteryHealth',
    'battery':            'batteryHealth',
    'SKU':                'sku',
    'שנת דגם':          'releaseYear',
    'שנת ייצור':        'releaseYear',
    'שנת יצור':         'releaseYear',
    'טכנולוגיית מסך':   'screenType',
    'screentype':         'screenType',
    'modelName':          'subModel',
    // CPU aliases (clean, no trailing space)
    'מעבד':              'cpu',
    'מעבד ':             'cpu',   // trailing space variant
    // GPU aliases (FIXED: was '\u05db\u05e8\u05d8\u05d9\u05e1 \u05de\u05e1\u05da ' with trailing space — never matched!)
    'gpu':                'gpu',
    'כרטיס מסך':       'gpu',   // ← FIXED (no trailing space)
    'כרטיס מסך ':      'gpu',   // trailing space variant
    'כרטיס גרפי':      'gpu',
    'graphics card':      'gpu',
    'graphics':           'gpu',
    // Resolution type (NEW)
    'סוג רזולוציה':    'resolutionType',
    'רזולוציה':          'resolutionType',
    'resolution type':    'resolutionType',
    // Refresh rate (NEW)
    'תדר רענון':       'refreshRate',
    'refresh rate':       'refreshRate',
    'הרץ':               'refreshRate',
    // OS (NEW)
    'מערכת הפעלה':     'os',
    'operating system':   'os',
    // Storage
    'נפח אחסון':       'storage',
    'אחסון':             'storage',
    // Broken/legacy aliases with trailing space (keep for safety)
    'רזלוציית מסך ':    'screen',   // typo variant + space
    'title':              null as unknown as string, // NOT a form field — block learning
  };
  const fieldTrimmed = field.trim(); // Remove accidental trailing spaces
  const canonicalField = CANONICAL_FIELD_MAP.hasOwnProperty(fieldTrimmed)
    ? CANONICAL_FIELD_MAP[fieldTrimmed]
    : fieldTrimmed;
  if (!canonicalField) {
    console.log(`[masterLearn] 🚫 BLOCKED: field "${field}" is not a form field (ghost field)`);
    return;
  }
  field = canonicalField;
  // ─────────────────────────────────────────────────────────────────────────────

  const textLower = text.toLowerCase();
  // ─── CANONICAL VALUE FORMAT ───────────────────────────────────────────────────
  // PROTOCOL: All values stored in FVR MUST use this exact format:
  //   lowercase → no underscores → single spaces → trimmed
  // This prevents case/underscore mismatches between DB values and parsed tokens.
  // ─────────────────────────────────────────────────────────────────────────────
  let valueLower = value
    .toLowerCase()
    .replace(/_/g, ' ')   // underscores → spaces (canonical: spaces only)
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();


  // 🚨 חוק ברזל: המערכת לעולם לא "לומדת" מספרים טהורים!
  // כל מספר טהור (כמו מחיר "5300", שנתון "2024" או זיכרון ללא יחידה "16")
  // הוא נתון משתנה, ולא ערך שאפשר להוסיף למילון קבוע או לטבלת עוגנים!
  // זיהוי מספרים נעשה אך ורק דינאמית (בעזרת יחידות ב-signal-engine, או HardSignals)
  const isStrictNumber = /^[\d.,]+$/.test(valueLower);
  if (isStrictNumber) {
    console.log(`[masterLearn] 🚫 BLOCKED: Refused to learn pure number "${valueLower}" for field [${field}]`);
    return { learned: 0, field, reason: "PURE_NUMBER_BLOCKED" };
  }
  
  let valIndexStr = textLower.indexOf(valueLower);
  
  // ---------------------------------------------------------
  // ⭐ Substring Intersection Learning (The "T14s" Solution)
  // If the user selected a full catalog name (e.g., "ThinkPad T14s Gen 4")
  // but the text only contains a part of it (e.g., "T14s"),
  // find the longest word from the selected dropdown that ACTUALLY EXISTS in the text!
  // ---------------------------------------------------------
  let usedSubstring = false;
  if (valIndexStr === -1) {
      // 1. ננסה לאתר את המילה הארוכה ביותר מתוך בחירת המשתמש שנמצאת בטקסט
      const parts = valueLower.split(/\s+/).filter(w => w.length > 2); 
      parts.sort((a, b) => b.length - a.length); // הארוך קודם
      for (const part of parts) {
          if (textLower.includes(part)) {
              valIndexStr = textLower.indexOf(part);
              valueLower = part; // המערכת תלמד את המילה החתוכה!
              usedSubstring = true;
              console.log(`[masterLearn] 🎯 Substring Intersection: Learning fragment "${part}" from catalog string.`);
              break;
          }
      }
  }

  // 2. אם גם זה נכשל, נסה לחלץ מספר נטו מתוך הטקסט האנגלי הארוך (רק למטרות עוגנים)
  if (valIndexStr === -1) {
      const numbersOnly = valueLower.match(/[\d.]+/);
      if (numbersOnly && numbersOnly[0]) {
          valIndexStr = textLower.indexOf(numbersOnly[0]);
          if (valIndexStr !== -1) {
              valueLower = numbersOnly[0]; // משתמשים רק במספר כעוגן
          }
      }
  }

  if (valIndexStr !== -1) {
    const beforeText = textLower.substring(0, valIndexStr).trim().split(/\s+/).filter(Boolean);
    const afterText = textLower.substring(valIndexStr + valueLower.length).trim().split(/\s+/).filter(Boolean);
    
    const preWords = beforeText.slice(-2).map(w => w.replace(/^[,"']+|[,"']+$/g, ""));
    const postWords = afterText.slice(0, 2).map(w => w.replace(/^[,"']+|[,"']+$/g, ""));
    
    // ─────────────────────────────────────────────────────────────
    // ANCHOR NOISE BLOCKLIST — imported from shared constants
    // (src/lib/constants/anchor-blocklist.ts)
    // ─────────────────────────────────────────────────────────────
    const ANCHOR_BLOCKLIST = ANCHOR_NOISE_BLOCKLIST;

    
    // פונקציית עזר לתרגום אחים ל"פנסים" (Anchors) במקום זיהום מילון הערכים
    const registerAnchor = async (words: string[], expectedDirection: "FORWARD" | "BACKWARD") => {
        if (words.length === 0) return;
        
        const anchorsToTest = [...words];
        if (words.length === 2) {
            anchorsToTest.push(words.join(" ")); // מוסיף את הצמד השלם כ"סופר עוגן"
        }

        for (const anchorPhrase of anchorsToTest) {
            if (anchorPhrase.length < 2) continue; // סינון אותיות קטנות
            
            // ⚠️ FIX: Block numbers from becoming anchors!
            if (/^\d+([.,]\d+)?([a-zA-Zא-ת]{1,4})?$/.test(anchorPhrase)) {
                console.log(`[AnchorGuard] Blocked number/size from becoming anchor: ${anchorPhrase}`);
                continue;
            }

            // ⚠️ BUG FIX: Block generic/noise words from becoming anchors.
            // These words appear adjacent to many different field values and create
            // ambiguous anchors that cause cross-field bleeding (e.g. "נייד" → Series).
            if (ANCHOR_BLOCKLIST.has(anchorPhrase.toLowerCase())) {
                console.log(`[AnchorGuard] Blocked generic word "${anchorPhrase}" from becoming anchor for field "${field}"`);
                continue;
            }
            
            // ⚠️ BUG FIX: The value itself should never be an anchor for its own field.
            // e.g., "Spectre" should not be registered as an anchor pointing to "series".
            if (anchorPhrase.toLowerCase() === valueLower.toLowerCase()) {
                continue;
            }

            // ──────────────────────────────────────────────────────────
            // CANDLE SUPREMACY RULE: נר חזק = מלך.
            // מלך יכול להיות מורה דרך (עוגן) לשדות אחרים, אך הוא לא יהיה עוגן לעצמו.
            // אם העוגן הפוטנציאלי כבר רשום כערך אמין במילון לאותו שדה!
            const CANDLE_SUPREMACY_THRESHOLD = 0.65;
            const candleEntry = await (prismadb as any).fieldValueReliability.findFirst({
                where: { value: anchorPhrase.toLowerCase(), category, isIgnored: false }
            });
            // חזרנו למקור: אסור לו להיות עוגן של *אותו השדה* שהוא הערך שלו. אך מותר לשדה אחר.
            if (candleEntry && candleEntry.confidence >= CANDLE_SUPREMACY_THRESHOLD && candleEntry.field === field) {
                console.log(`👑 [CandleSupremacy] "${anchorPhrase}" blocked from becoming anchor for its OWN field [${field}]`);
                continue;
            }
            // ──────────────────────────────────────────────────────────

            // בדוק אם העוגן כבר קיים
            let existingAnchor = await (prismadb as any).fieldAnchor.findFirst({
                where: { phrase: anchorPhrase, category }
            });

            if (!existingAnchor) {
                // עוגן חדש — נוצר עם confidence נפרדת לשדה הזה
                await (prismadb as any).fieldAnchor.create({
                    data: { 
                        phrase: anchorPhrase, 
                        category, 
                        relatedFields: [field],
                        expectedDirection,
                        confidence: 0.2,
                        fieldConfidences: { [field]: 0.2 },  // ← per-field confidence
                        minDistance: 1,
                        maxDistance: words.length > 1 ? 4 : 2,
                        occurrenceCount: 1
                    }
                });
            } else {
                // העוגן קיים — מעדכן per-field confidence + סה"כ
                let updatedFields = existingAnchor.relatedFields || [];
                if (!updatedFields.includes(field)) {
                    updatedFields.push(field);
                }

                const newCount = (existingAnchor.occurrenceCount || 0) + 1;

                // ── Asymptotic confidence growth (מונע חריגה מעל 1.0) ──────────
                // newConf = old + (1 - old) × 0.05  → מתכנס ל-1.0, לעולם לא חורג
                const oldConf = Number(existingAnchor.confidence) || 0.2;
                const newGlobalConf = Math.min(0.99, oldConf + (1 - oldConf) * 0.05);

                // ── Per-field confidence — עדכון לשדה הספציפי בלבד ────────────
                const existingFC = (existingAnchor.fieldConfidences as Record<string, number>) || {};
                const oldFieldConf = existingFC[field] ?? 0.2;
                const newFieldConf = Math.min(0.99, oldFieldConf + (1 - oldFieldConf) * 0.05);
                const updatedFC = { ...existingFC, [field]: newFieldConf };

                // ⚡ מנגנון החייאה — שלב א:
                const REVIVAL_THRESHOLD = 5;
                const shouldRevive = existingAnchor.isIgnored && newCount >= REVIVAL_THRESHOLD;

                await (prismadb as any).fieldAnchor.update({
                    where: { id: existingAnchor.id },
                    data: { 
                        occurrenceCount: { increment: 1 }, 
                        confidence: shouldRevive ? 0.55 : newGlobalConf,
                        fieldConfidences: shouldRevive 
                            ? { [field]: 0.55 } 
                            : updatedFC,
                        relatedFields: updatedFields,
                        isIgnored: shouldRevive ? false : existingAnchor.isIgnored
                    }
                });

                if (shouldRevive) {
                    console.log(`🔄 [REVIVAL] עוגן "${anchorPhrase}" → [${updatedFields.join(',')}] הוחיה אחרי ${newCount} אישורים!`);
                }
            }
        }
    };

    // הפעלה: מה שלפני הערך הוא פנס שמאיר קדימה, מה שאחרי מאיר אחורה (סיומת)
    await registerAnchor(preWords, "FORWARD");
    await registerAnchor(postWords, "BACKWARD");
  }

  // ⚡ מנגנון החייאה — שלב ב:
  // לאחר רישום העוגנים מהטקסט הנוכחי, בדוק אם יש עוגנים מוחרמים שמופיעים בטקסט זה
  // ושה-relatedFields שלהם מתאימים לשדה הנוכחי → תן להם נקודת החייאה נוספת
  try {
    const REVIVAL_THRESHOLD = 5;
    const ignoredAnchors = await (prismadb as any).fieldAnchor.findMany({
        where: { category, isIgnored: true }
    });
    for (const ia of ignoredAnchors) {
        const matchesField = ia.relatedFields.length === 0 || ia.relatedFields.includes(field);
        const appearsInText = textLower.includes(ia.phrase.toLowerCase());
        if (appearsInText && matchesField) {
            const newCount = (ia.occurrenceCount || 0) + 1;
            const shouldRevive = newCount >= REVIVAL_THRESHOLD;
            await (prismadb as any).fieldAnchor.update({
                where: { id: ia.id },
                data: {
                    occurrenceCount: { increment: 1 },
                    // עוגן ריק שמופיע ליד שדה חדש → קשר אותו לשדה!
                    relatedFields: ia.relatedFields.length === 0 ? [field] : ia.relatedFields,
                    isIgnored: shouldRevive ? false : true,
                    confidence: shouldRevive ? 0.55 : ia.confidence
                }
            });
            if (shouldRevive) {
                console.log(`🔄 [REVIVAL-B] עוגן "${ia.phrase}" → [${ia.relatedFields.join(',') || field}] הוחיה לאחר ${newCount} אישורים בטקסט!`);
            }
        }
    }
  } catch(e) { /* non-critical */ }

  // 2. עדכון אוצר המילים (הנרות / Candles)
  // חוק ברזל: מספרים טהורים (מחירים, גדלים) לעולם לא נכנסים לנרות!
  // הם מנוהלים אך ורק ע"י שכבת הפנסים (FieldAnchor). רק ערכים טקסטואליים משמעותיים נכנסים לנרות.
  const isPureNumber2 = /^\d+([.,]\d+)?([a-zA-Zא-ת]{1,4})?$/.test(valueLower.trim());
  if (isPureNumber2) {
    // מספר: הלמידה בוצעה בפנסים לעיל. מסיימים כאן.
    return { success: true };
  }

  // 3. עדכון ערכי מילון — אם ערך היה מוחרם ומשתמש מאשר אותו שוב: ספור!
  // לאחר 3 אישורים מפורשים (occurrenceCount) — בטל החרמה!
  const DICT_REVIVAL_THRESHOLD = 3;
  // אנחנו שומרים את מקטע הערך אם עשינו חיתוך, אחרת את הערך המלא (אלא אם הוא נכשל שוב)
  const finalCandleValue = valueLower;

  // ─── VIP GUARD (Exclusive Field Protection) ─────────────────────
  // If this value is already a strong candle (confidence >= 0.65) for a DIFFERENT field,
  // we strictly block it from being learned for this new field!
  // A single word cannot mean both 'cpu' and 'subModel'.
  const VIP_SUPREMACY_THRESHOLD = 0.65;
  const existingOtherFieldCandle = await (prismadb as any).fieldValueReliability.findFirst({
      where: { 
          value: finalCandleValue, 
          category,
          field: { not: field },
          isIgnored: false,
          confidence: { gte: VIP_SUPREMACY_THRESHOLD }
      }
  });

  if (existingOtherFieldCandle) {
      console.log(`🛡️ [VIP Guard] BLOCKED learning "${finalCandleValue}" for field [${field}] because it is already a locked VIP for [${existingOtherFieldCandle.field}]!`);
      return { success: false, reason: "VIP_LOCKED_BY_OTHER_FIELD" };
  }
  // ─────────────────────────────────────────────────────────────────

  const existingDictEntry = await (prismadb as any).fieldValueReliability.findFirst({
      where: { value: finalCandleValue, field, category }
  });
  const isRevivingDict = existingDictEntry?.isIgnored && 
      (existingDictEntry.occurrenceCount + 1) >= DICT_REVIVAL_THRESHOLD;

  // ── Asymptotic confidence growth for dictionary values ──────────────
  const existingConf = existingDictEntry?.confidence ?? 0.6;
  const newDictConf = Math.min(0.99, existingConf + (1 - existingConf) * 0.05);

  const upsertedDict = await (prismadb as any).fieldValueReliability.upsert({
    where: {
      value_field_category: {
        value: finalCandleValue,
        field,
        category
      }
    },
    update: {
      occurrenceCount: { increment: 1 },
      confidence: isRevivingDict ? 0.6 : newDictConf,  // אם חייה — התחל מ-0.6
      isIgnored: isRevivingDict ? false : undefined
    },
    create: {
      value: finalCandleValue,
      field,
      category,
      confidence: 0.6,
      occurrenceCount: 1
    }
  });
  if (isRevivingDict) {
      console.log(`🔄 [REVIVAL-DICT] ערך "${finalCandleValue}" → [${field}] הוחיה לאחר ${DICT_REVIVAL_THRESHOLD} אישורים!`);
  }

  // ─────────────────────────────────────────────────────────────────
  // ⭐ PROMOTION TO DROPDOWN (formFieldOption)
  // כשהמשתמש אישר את הערך מספיק פעמים (למשל 3 פעמים),
  // נכניס אותו ישירות לרשימה הקופצת של הפרונטאנד כדי שלעולם לא יקבל התעלמות!
  // ─────────────────────────────────────────────────────────────────
  const DROPDOWN_PROMOTION_THRESHOLD = 3;
  if (upsertedDict && upsertedDict.occurrenceCount >= DROPDOWN_PROMOTION_THRESHOLD) {
      try {
          const existingOption = await (prismadb as any).formFieldOption.findFirst({
              where: { fieldId: field, category: category, value: finalCandleValue }
          });
          if (!existingOption) {
              await (prismadb as any).formFieldOption.create({
                  data: {
                      fieldId: field,
                      category: category,
                      value: finalCandleValue,
                      labelHera: `${finalCandleValue} (AI)`, // מסמן שזה הגיע מלמידה
                  }
              });
              console.log(`🚀 [DROPDOWN PROMOTION] הערך "${finalCandleValue}" הגיע ל-${upsertedDict.occurrenceCount} אישורים וקודם רשמית לתפריט הנגלל של [${field}]!`);
          }
      } catch (e) {
          console.error("Failed to promote to formFieldOption:", e);
      }
  }

  // איפוס קאש קריטי כדי שה-Client Testing Live יעבוד מיידית (60s Bypass)
  dbCache.clear(`ai_reliable_vals_${category}`);
  dbCache.clear(`ai_anchors_${category}`);
  dbCache.clear(`ai_alias_${category}`);
  try { revalidateTag(`db_cache_ai_reliable_vals_${category}`); } catch(e) {}
  try { revalidateTag(`db_cache_ai_anchors_${category}`); } catch(e) {}

  // 3. Signal Engine — upsert the detected word as a FieldSignal
  // This closes the self-learning loop: every confirmed value feeds back into the Signal Engine
  try {
    const detectedWord = value.toLowerCase().trim();
    if (detectedWord.length >= 2) {
      // ── Asymptotic growth for signal weights ──────────────────────
      const existingSignal = await (prismadb as any).fieldSignal.findFirst({
          where: { category, field, rawValue: detectedWord }
      });
      const oldWeight = existingSignal?.weight ?? 0.6;
      const newWeight = Math.min(0.99, oldWeight + (1 - oldWeight) * 0.05);

      await (prismadb as any).fieldSignal.upsert({
        where: {
          category_field_rawValue: {
            category,
            field,
            rawValue: detectedWord
          }
        },
        update: {
          weight: newWeight,
          isIgnored: false
        },
        create: {
          category,
          field,
          rawValue: detectedWord,
          normalized: detectedWord,
          signalType: "VALUE",
          weight: 0.6
        }
      });
    }
  } catch (e) {
    // Non-critical: signal upsert failure should not block the main learn flow
    console.error("FieldSignal upsert failed (non-critical):", e);
  }

  return { success: true };
}

/**
 * משיכת שדות נלמדים תוך חיבור עם CategoryFieldThreshold
 * כפי שנתבקש - חיבור ישיר לקוד הקיים ולא המצאת לוגיקה נפרדת
 */
export async function getLearnedThresholds(category?: string | null) {
  const whereClause = category && category !== "All" ? { category } : {};

  // 1. Get explicit thresholds from the Schema
  const explicitThresholds = await (prismadb as any).categoryFieldThreshold.findMany({
    where: whereClause,
  });

  // 2. Schema groupBy FieldValueReliability (the learned fields)
  const learnedFields = await (prismadb as any).fieldValueReliability.groupBy({
    by: ['category', 'field'],
    _sum: { occurrenceCount: true },
    ...(whereClause.category ? { where: whereClause } : {})
  });

  const mergedMap = new Map();

  explicitThresholds.forEach((t: any) => {
    mergedMap.set(`${t.category}_${t.field}`, {
      id: t.id,
      category: t.category,
      field: t.field,
      threshold: t.threshold,
      suggestionMargin: t.suggestionMargin,
      occurrenceCount: 0 
    });
  });

  learnedFields.forEach((lf: any) => {
    const key = `${lf.category}_${lf.field}`;
    const sumCount = lf._sum.occurrenceCount || 0;
    if (mergedMap.has(key)) {
      mergedMap.get(key).occurrenceCount = sumCount;
    } else {
      mergedMap.set(key, {
        id: null,
        category: lf.category,
        field: lf.field,
        threshold: 0.8, // ברירת מחדל
        suggestionMargin: 0.4, // ברירת מחדל לפער
        occurrenceCount: sumCount
      });
    }
  });

  return Array.from(mergedMap.values()).sort((a, b) => {
    if (b.occurrenceCount !== a.occurrenceCount) return b.occurrenceCount - a.occurrenceCount;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.field.localeCompare(b.field);
  });
}

/**
 * שמירת Threshold חדש ישירות לטבלה המוגדרת CategoryFieldThreshold
 */
export async function updateThresholdConfig(category: string, field: string, threshold: number, suggestionMargin: number) {
  return await (prismadb as any).categoryFieldThreshold.upsert({
    where: { category_field: { category, field } },
    update: { threshold: Number(threshold), suggestionMargin: Number(suggestionMargin) },
    create: { category, field, threshold: Number(threshold), suggestionMargin: Number(suggestionMargin) }
  });
}

/**
 * איפוס/מחיקה של טרשהולד ספציפי (החזרה לברירת מחדל של המערכת)
 */
export async function deleteThresholdConfig(id: string) {
  return await (prismadb as any).categoryFieldThreshold.delete({ where: { id } });
}


/**
 * PRUNER (גנן חכם) - מבוסס נפח, לא זמן
 *
 * שלב 1 (dev):       לא גוזז - DB קטן מ-1000 records
 * שלב 2 (beta):      גוזז כשDB > 50,000 records
 * שלב 3 (production): 'min age' יורד אוטומטית עם גידול
 *
 * @param dryRun - אם true, רק מציג מה היה נמחק (לא מוחק בפועל)
 * @param force  - אם true, מתעלם מ-MIN_DB_SIZE (לשימוש ידני Admin בלבד)
 */
/**
 * ניהול מלחמת הכתר בעקבות תיקון מנהל: תגמול למנצח וענישה למפסיד
 */
export async function handleCorrectionWar(originalText: string, predictedData: any, correctedData: any, category: string) {
    if (!predictedData || !correctedData) return;
    
    // Convert Ai predicted list (e.g., from analyze.ts) into a simple field->value map
    const aiMap: Record<string, string> = {};
    if (Array.isArray(predictedData)) {
      predictedData.forEach(p => {
         if (p.field && p.value !== undefined && p.value !== null) {
             aiMap[p.field] = String(p.value);
         }
      });
    } else if (typeof predictedData === 'object') {
      for (const [k, v] of Object.entries(predictedData)) {
          if (v !== undefined && v !== null) aiMap[k] = String(v);
      }
    }
    
    // Compare against what the user validated
    for (const [field, userValue] of Object.entries(correctedData)) {
       if (userValue === null || userValue === undefined) continue;
       const userValClean = String(userValue).trim();
       const aiValClean = aiMap[field] ? String(aiMap[field]).trim() : undefined;
       
       if (aiValClean && aiValClean.toLowerCase() !== userValClean.toLowerCase()) {
           console.log(`👑 [Crown War] Conflict on ${field}: AI guessed '${aiValClean}', User corrected to '${userValClean}'`);
           
           // 1. Penalize the loser
           await masterPenalize(field, aiValClean, category);
           
           // 2. Reward the winner
           if (originalText && userValClean.length > 0) {
              await masterLearn(originalText, field, userValClean, category);
           }
           
           // 3. Register continuous learning ALIAS (e.g. "לנובו" -> "Lenovo")
           // This perfectly maps misspelled or Hebrew words to English canonicals!
           if (aiValClean.length > 1 && userValClean.length > 1) {
              try {
                const detectedRaw = aiValClean.toLowerCase().trim();
                await (prismadb as any).fieldSignal.upsert({
                  where: {
                    category_field_rawValue: {
                      category,
                      field,
                      rawValue: detectedRaw
                    }
                  },
                  update: {
                    normalized: userValClean.trim(),
                    signalType: "ALIAS",
                    weight: 0.9,
                    isIgnored: false
                  },
                  create: {
                    category,
                    field,
                    rawValue: detectedRaw,
                    normalized: userValClean.trim(),
                    signalType: "ALIAS",
                    weight: 0.9,
                    isIgnored: false
                  }
                });
                console.log(`🧠 [Self-Learning] Registered dynamic alias: "${detectedRaw}" -> "${userValClean}" for field [${field}]`);
              } catch (e) {
                console.error("Failed to register alias:", e);
              }
           }
       } else if (!aiValClean && userValClean.length > 0 && originalText) {
           // AI totally missed it, user added it manually - Reward the winner
           await masterLearn(originalText, field, userValClean, category);
       }
    }
}

export async function pruneWeakNodes(dryRun = false, force = false): Promise<{
  skipped?: string;
  totalDbSize: number;
  prunedDictionary: number;
  prunedSignals: number;
  evictedCandleAnchors: number;
}> {
  const MIN_CONF    = 0.20;
  const MIN_OCC     = 5;
  const MIN_DB_SIZE = 1000; // מינימום records לפני שהמערכת מוכנה לגזום

  const totalDictCount    = await (prismadb as any).fieldValueReliability.count();
  const totalDbSize       = totalDictCount;

  if (!force && totalDbSize < MIN_DB_SIZE) {
    console.log(`[pruner] SKIPPED: DB too small (${totalDbSize} < ${MIN_DB_SIZE})`);
    return { skipped: `DB too small: ${totalDbSize}/${MIN_DB_SIZE} records`, totalDbSize, prunedDictionary: 0, prunedSignals: 0, evictedCandleAnchors: 0 };
  }

  // גיל מינימלי משתנה לפי גודל DB: אקסיומום 90 יוםב-dev, מינימום 7 יום ב-production
  const maturityRatio = Math.min(1, totalDbSize / 100000); // 0..1
  const minAgeDays    = Math.round(90 - (83 * maturityRatio)); // 90d -> 7d as DB grows
  const cutoffDate    = new Date(Date.now() - minAgeDays * 24 * 60 * 60 * 1000);

  let prunedDictionary      = 0;
  let prunedSignals         = 0;
  let evictedCandleAnchors  = 0;

  try {
    const weak = await (prismadb as any).fieldValueReliability.findMany({
      where: { confidence: { lt: MIN_CONF }, occurrenceCount: { gte: MIN_OCC }, createdAt: { lt: cutoffDate } },
      select: { id: true }
    });
    if (!dryRun && weak.length > 0)
      await (prismadb as any).fieldValueReliability.deleteMany({ where: { id: { in: weak.map((d: any) => d.id) } } });
    prunedDictionary = weak.length;
  } catch(e) { console.error("[pruner] Dictionary:", e); }

  try {
    const weak = await (prismadb as any).fieldSignal.findMany({
      where: { weight: { lt: MIN_CONF }, createdAt: { lt: cutoffDate } },
      select: { id: true }
    });
    if (!dryRun && weak.length > 0)
      await (prismadb as any).fieldSignal.deleteMany({ where: { id: { in: weak.map((s: any) => s.id) } } });
    prunedSignals = weak.length;
  } catch(e) { console.error("[pruner] Signals:", e); }

  // ── CANDLE EVICTION SWEEP ─────────────────────────────────────────────────
  // כל עוגן שהפך לנר חזק עבור שדה X → התפקיד שלו כעוגן לשדה X נמחק!
  // אבל התפקידים שלו כעוגן לשדות Y, Z נשמרים.
  try {
    const CANDLE_SUPREMACY_THRESHOLD = 0.65;

    // טוען את כל הנרות החזקים (value, category, field)
    const strongCandles = await (prismadb as any).fieldValueReliability.findMany({
      where: { confidence: { gte: CANDLE_SUPREMACY_THRESHOLD }, isIgnored: false },
      select: { value: true, field: true, category: true }
    });

    // מיפוי של phrase+category -> למערך של איזה שדות הוא נר עבורם
    const strongCandleMap = new Map<string, string[]>();
    for (const c of strongCandles) {
      const key = `${c.category}::${c.value}`;
      if (!strongCandleMap.has(key)) strongCandleMap.set(key, []);
      strongCandleMap.get(key)!.push(c.field);
    }

    const anchorsToEvict = await (prismadb as any).fieldAnchor.findMany({
      where: { isIgnored: false },
      select: { id: true, phrase: true, category: true, relatedFields: true }
    });

    for (const anchor of anchorsToEvict) {
      const key = `${anchor.category}::${anchor.phrase.toLowerCase()}`;
      const candleFields = strongCandleMap.get(key);
      
      if (candleFields && candleFields.length > 0) {
        // מסנן החוצה שדות שבהם המילה משמשת גם כנר וגם כעוגן
        const originalCount = anchor.relatedFields.length;
        const filteredFields = anchor.relatedFields.filter((f: string) => !candleFields.includes(f));
        
        // אם מצאנו התנגשות שצריך לחתוך:
        if (filteredFields.length !== originalCount) {
          const removedFieldInfo = anchor.relatedFields.filter((f: string) => candleFields.includes(f)).join(',');
          
          if (!dryRun) {
            await (prismadb as any).fieldAnchor.update({
              where: { id: anchor.id },
              data: {
                relatedFields: filteredFields,
                isIgnored: filteredFields.length === 0, // מת רק אם לא נותרו שדות חוקיים
              }
            });
          }
          
          evictedCandleAnchors++;
          console.log(`👑 [CandleEviction] anchor "${anchor.phrase}" → removed role as anchor for [${removedFieldInfo}] (it is a strong candle there). Remaining roles: [${filteredFields.join(',')}]`);
        }
      }
    }
  } catch(e) { console.error("[pruner] CandleEviction:", e); }
  // ─────────────────────────────────────────────────────────────────────────

  console.log(`[pruner] ${dryRun ? "DRY-RUN" : "DONE"} (DB=${totalDbSize}, minAge=${minAgeDays}d): Dict=${prunedDictionary} Sig=${prunedSignals} Evicted=${evictedCandleAnchors}`);
  return { totalDbSize, prunedDictionary, prunedSignals, evictedCandleAnchors };
}
