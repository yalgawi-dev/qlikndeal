import prismadb from "./prismadb";

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
  const PENALTY_DICT      = 0.05;  // עונש למילון
  const PENALTY_SIGNAL    = 0.10;  // עונש לסיגנל (חמור יותר - ישיר יותר)
  const PENALTY_CONTEXT   = 0.05;  // עונש לדי-אן-אי
  const MIN_CONFIDENCE    = 0.0;   // סף 0 מאפשר "הוצאה לגמלאות" (Pruning)
  const PRUNE_THRESHOLD   = 0.01;  // מתחת לזה הערך מוחרם

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

  // 3. ענישה ב-ContextPattern (ה-DNA) - מוריד ביטחון לנכד
  try {
    const grandchild = await (prismadb as any).contextPattern.findFirst({
      where: { patternPart: field, type: "FIELD", field, category }
    });
    if (grandchild) {
      const newConf = Math.max(MIN_CONFIDENCE, Number(grandchild.confidence) - PENALTY_CONTEXT);
      const shouldIgnore = newConf < PRUNE_THRESHOLD || grandchild.isIgnored;
      await (prismadb as any).contextPattern.update({
        where: { id: grandchild.id },
        data: { confidence: newConf, isIgnored: shouldIgnore }
      });
      penalized++;
    }
  } catch(e) { /* non-critical */ }

  return { penalized, field, wrongValue };
}

/**
 * למידה מתוך נתונים מובנים (ייבוא קטלוג)
 */
export async function learnFromImport(field: string, value: any, category: string) {
  if (!value) return;
  const values = Array.isArray(value) ? value : [value];

  for (const v of values) {
    const cleanValue = String(v).toLowerCase().trim();
    if (cleanValue.length < 2) continue;

    try {
      await (prismadb as any).fieldValueReliability.upsert({
        where: {
          value_field_category: {
            value: cleanValue,
            field: field,
            category: category
          }
        },
        update: {
          occurrenceCount: { increment: 1 },
          confidence: { increment: 0.01 }
        },
        create: {
          value: cleanValue,
          field: field,
          category: category,
          confidence: 0.9,
          occurrenceCount: 1
        }
      });
    } catch (e) {
      console.error("Dictionary update failed:", e);
    }
  }
}

/**
 * למידה מטקסט חופשי (מתוך תיאור המודעה)
 */
export async function masterLearn(text: string, field: string, value: string, category: string) {
  const textLower = text.toLowerCase();
  let valueLower = value.toLowerCase().trim();
  
  // אם הערך הוא "32GB", "15.6 אינץ" וכו', והטקסט לא מכיל את ה-GB, נחלץ רק את המספר לצורך זיהוי אחיזה
  let valIndexStr = textLower.indexOf(valueLower);
  
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
    
    // פונקציית עזר לרישום אחים (עבור מילים לפני ואחרי המספר)
    const registerBrothers = async (words: string[], positionType: string) => {
        if (words.length === 0) return;
        
        const brothers = [...words];
        if (words.length === 2) {
            brothers.push(words.join(" ")); // מוסיף את הצמד השלם (אח שלישי)
        }

        for (const brother of brothers) {
            if (brother.length < 2) continue; // דילוג על מכתבים בודדים

            // 1. הסבא (שורש המילה או הצמד)
            let root = await (prismadb as any).contextPattern.findFirst({
                where: { patternPart: brother, type: positionType, category }
            });
            if (!root) {
                root = await (prismadb as any).contextPattern.create({
                    data: { patternPart: brother, type: positionType, category, confidence: 0.2, field: "general" }
                });
            }

            // 2. הנכד (נקודת החיבור לתא/לשדה)
            let grandchild = await (prismadb as any).contextPattern.findFirst({
                where: { patternPart: field, parentId: root.id, type: "FIELD" }
            });
            
            if (!grandchild) {
                await (prismadb as any).contextPattern.create({
                    data: { patternPart: field, type: "FIELD", category, parentId: root.id, confidence: 0.5, field: field }
                });
            } else {
                // למידה מתמדת: קידום המשקל
                const newGrandchild = await (prismadb as any).contextPattern.update({
                    where: { id: grandchild.id },
                    data: { occurrenceCount: { increment: 1 }, confidence: { increment: 0.05 } }
                });

                // === THE HARVESTER (קציר הפירות) ===
                // המילה לא נמחקת מהמשפחה, חיה לעד לבדוק תנודות. אבל מועתקת למילון הרשמי אם יש רף ביטחון גבוה
                if (newGrandchild.occurrenceCount > 5 && newGrandchild.confidence > 0.85) {
                   await (prismadb as any).fieldValueReliability.upsert({
                      where: {
                          value_field_category: {
                              value: brother,
                              field: field,
                              category: category
                          }
                      },
                      update: { confidence: Math.max(0.85, newGrandchild.confidence), isIgnored: false },
                      create: {
                          value: brother,
                          field: field,
                          category: category,
                          confidence: newGrandchild.confidence,
                          occurrenceCount: newGrandchild.occurrenceCount
                      }
                   });
                }
            }
        }
    };

    // הפעלה כפולה וסימטרית לאחים מלפני הערך ולאחים שאחרי הערך
    await registerBrothers(preWords, "PREFIX_ROOT");
    await registerBrothers(postWords, "SUFFIX_ROOT");
  }

  // 2. עדכון אוצר המילים (המילון)
  await (prismadb as any).fieldValueReliability.upsert({
    where: {
      value_field_category: {
        value: value.toLowerCase().trim(),
        field,
        category
      }
    },
    update: {
      occurrenceCount: { increment: 1 },
      confidence: { increment: 0.02 },
      isIgnored: false
    },
    create: {
      value: value.toLowerCase().trim(),
      field,
      category,
      confidence: 0.6,
      occurrenceCount: 1
    }
  });

  // 3. Signal Engine — upsert the detected word as a FieldSignal
  // This closes the self-learning loop: every confirmed value feeds back into the Signal Engine
  try {
    const detectedWord = value.toLowerCase().trim();
    if (detectedWord.length >= 2) {
      await (prismadb as any).fieldSignal.upsert({
        where: {
          category_field_rawValue: {
            category,
            field,
            rawValue: detectedWord
          }
        },
        update: {
          weight: { increment: 0.05 },
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
       } else if (!aiValClean && userValClean.length > 0 && originalText) {
           // AI totally missed it, user added it manually - Reward the winner
           await masterLearn(originalText, field, userValClean, category);
       }
    }
}

export async function pruneWeakNodes(dryRun = false, force = false): Promise<{
  skipped?: string;
  totalDbSize: number;
  prunedContextPatterns: number;
  prunedDictionary: number;
  prunedSignals: number;
}> {
  const MIN_CONF    = 0.20;
  const MIN_OCC     = 5;
  const MIN_DB_SIZE = 1000; // מינימום records לפני שהמערכת מוכנה לגזום

  const totalContextCount = await (prismadb as any).contextPattern.count();
  const totalDictCount    = await (prismadb as any).fieldValueReliability.count();
  const totalDbSize       = totalContextCount + totalDictCount;

  if (!force && totalDbSize < MIN_DB_SIZE) {
    console.log(`[pruner] SKIPPED: DB too small (${totalDbSize} < ${MIN_DB_SIZE})`);
    return { skipped: `DB too small: ${totalDbSize}/${MIN_DB_SIZE} records`, totalDbSize, prunedContextPatterns: 0, prunedDictionary: 0, prunedSignals: 0 };
  }

  // גיל מינימלי משתנה לפי גודל DB: אקסיומום 90 יוםב-dev, מינימום 7 יום ב-production
  const maturityRatio = Math.min(1, totalDbSize / 100000); // 0..1
  const minAgeDays    = Math.round(90 - (83 * maturityRatio)); // 90d -> 7d as DB grows
  const cutoffDate    = new Date(Date.now() - minAgeDays * 24 * 60 * 60 * 1000);

  let prunedContextPatterns = 0;
  let prunedDictionary      = 0;
  let prunedSignals         = 0;

  try {
    const weak = await (prismadb as any).contextPattern.findMany({
      where: { confidence: { lt: MIN_CONF }, occurrenceCount: { gte: MIN_OCC }, createdAt: { lt: cutoffDate } },
      select: { id: true }
    });
    if (!dryRun && weak.length > 0)
      await (prismadb as any).contextPattern.deleteMany({ where: { id: { in: weak.map((p: any) => p.id) } } });
    prunedContextPatterns = weak.length;
  } catch(e) { console.error("[pruner] ContextPattern:", e); }

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

  console.log(`[pruner] ${dryRun ? "DRY-RUN" : "DONE"} (DB=${totalDbSize}, minAge=${minAgeDays}d): CP=${prunedContextPatterns} Dict=${prunedDictionary} Sig=${prunedSignals}`);
  return { totalDbSize, prunedContextPatterns, prunedDictionary, prunedSignals };
}
