import prismadb from "@/lib/prismadb";
import stringSimilarity from "string-similarity";
import * as fs from 'fs';
import path from 'path';
import { detectCategory } from "./matcher-core";
import { getEnhancedNlp } from "./nlp-dictionary";
import { normalizeHebrew } from "./hebrew-normalizer";
import { extractSignals, bindNumbersToUnits } from "./signal-engine";
import { dbCache } from "./db-cache";

const CONFIG_PATH = path.join(process.cwd(), "src/config/matcher-config.json");

function getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    if (Math.abs(a.length - b.length) > 2) return 99; // Fast bail-out for performance
    
    // Fast 1D array implementation to prevent Vercel GC/Memory OOM
    const v0 = Array.from({ length: b.length + 1 }, (_, i) => i);
    const v1 = new Array(b.length + 1);

    for (let i = 0; i < a.length; i++) {
        v1[0] = i + 1;
        for (let j = 0; j < b.length; j++) {
            const cost = a[i] === b[j] ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for (let j = 0; j <= b.length; j++) {
            v0[j] = v1[j];
        }
    }
    return v0[b.length];
}

/**
 * Temporal Decay - signals/dict שלא אושרו לאחרונה מאבדים משקל
 * Half-life: 180 יום. מינימום: 0.30 (לא מוחקים לחלוטין)
 */
function getTemporalDecay(updatedAt: Date | string): number {
    const ageDays = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.30, Math.exp(-ageDays / 180));
}

/**
 * Family Affinity (Return to Source) - חזרה מהמילון למשפחה שיצרה אותו
 * עבור שדה נתון, מוצא את כל מילות ההקשר (PREFIX_ROOT) שניבאו אותו,
 * ובודק כמה מהן קיימות בטקסט הנוכחי.
 * 
 * פותר: "עולה" ב-price(0.95) ו-temperature(0.85)
 * אם "₪","שקל" קיימים בטקסט → price מקבל Family Affinity גבוה → מנצח!
 */
function computeFamilyAffinity(
    field: string,
    textLower: string,
    fieldNodesByField: Map<string, any[]>,
    contextMapById: Map<string, any>
): number {
    const fieldNodes = fieldNodesByField.get(field);
    if (!fieldNodes || fieldNodes.length === 0) return 0;

    let matchedWeight = 0;
    let totalWeight   = 0;

    for (const fieldNode of fieldNodes) {
        // O(1) Lookup instead of O(N) Array.find to completely eliminate O(N^2) latency
        const parent = contextMapById.get(fieldNode.parentId);
        if (!parent || parent.patternPart.length < 2) continue;

        const w = Number(fieldNode.confidence) || 0.5;
        totalWeight += w;
        if (textLower.includes(parent.patternPart.toLowerCase())) {
            matchedWeight += w;
        }
    }

    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
}

export async function masterAnalyze(text: string, providedCategory?: string) {
    if (!text) return [];

    console.log("🔥 masterAnalyze CALLED");

    console.time("TOTAL_ANALYZE");
    console.log("ENV:", process.env.NODE_ENV);
    console.log("PLATFORM:", process.env.VERCEL ? "VERCEL" : "LOCAL");

    // STEP 1: Routing & Categorization
    let category = (providedCategory && providedCategory !== "UNKNOWN") 
        ? providedCategory.toUpperCase() 
        : (await detectCategory(text)).toUpperCase();
        
    if (category === "UNKNOWN") return [];

    // Load Config
    let config: any = { thresholds: { global_fill: 0.85, global_suggest: 0.45 } };
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
            config = { ...config, ...parsed };
            if (!config.thresholds) config.thresholds = { global_fill: 0.85, global_suggest: 0.45 };
        } catch(e) {}
    }

    // ---------------- DB FETCH + NLP IN PARALLEL ----------------
    // ⚡ DB and NLP are completely independent — fire them simultaneously!
    console.time("DB_FETCH");
    const cleanFullText = normalizeHebrew(text);

    const [
        [
            categoryThresholdsRaw,
            formStructs,
            fieldOptions,
            allReliableValues,
            allContextPatternsRaw,
            allSignalsRaw
        ],
        nlpEngine
    ] = await Promise.all([
        // BRANCH A: All 6 DB queries in parallel
        Promise.all([
            dbCache.getOrFetch<any[]>(`threshold_${category}`, () =>
                (prismadb as any).categoryFieldThreshold.findMany({
                    where: { category: { equals: category, mode: 'insensitive' } }
                })
            ),
            dbCache.getOrFetch<any[]>(`structs_${category}`, () =>
                (prismadb as any).categoryFormStructure.findMany({ where: { category } })
            ),
            dbCache.getOrFetch<any[]>(`opts_${category}`, () =>
                (prismadb as any).formFieldOption.findMany({ where: { category } })
            ),
            dbCache.getOrFetch<any[]>(`rel_${category}`, () =>
                (prismadb as any).fieldValueReliability.findMany({ where: { category, isIgnored: false } })
            ),
            dbCache.getOrFetch<any[]>(`ctx_${category}`, () =>
                (prismadb as any).contextPattern.findMany({ where: { category, isIgnored: false }, include: { children: true } })
            ),
            dbCache.getOrFetch<any[]>(`sig_${category}`, () =>
                (prismadb as any).fieldSignal.findMany({ where: { category, isIgnored: false } })
            )
        ]),
        // BRANCH B: NLP lexicon build (completely independent from DB!)
        getEnhancedNlp().catch(() => null)
    ]);
    console.timeEnd("DB_FETCH");

    // Build threshold map
    const thresholdMap = new Map();
    try {
        categoryThresholdsRaw.forEach((t: any) => {
            thresholdMap.set(t.field, { threshold: Number(t.threshold), margin: Number(t.suggestionMargin) });
        });
    } catch (e) { console.error("Threshold map error", e); }

    // Build numericFields
    const numericFields = new Set<string>(['price', 'year', 'mileage']);
    let formStructsCount = 0;
    let fieldOptionsCount = 0;
    try {
        formStructsCount = formStructs?.length || 0;
        fieldOptionsCount = fieldOptions?.length || 0;
        for (const struct of formStructs) {
            if (struct.fieldType === 'number') {
                numericFields.add(struct.fieldId.toLowerCase());
            } else if (struct.fieldType === 'select') {
                const opts = fieldOptions.filter((o: any) => o.fieldId === struct.fieldId);
                if (opts.length > 0) {
                    const numberOpts = opts.filter((o: any) => /\d/.test(o.value));
                    if (numberOpts.length / opts.length >= 0.5) {
                        numericFields.add(struct.fieldId.toLowerCase());
                    }
                }
            }
        }
    } catch (e) {
        ['ram', 'storage', 'enginesize', 'screen', 'batteryhealth', 'battery'].forEach(f => numericFields.add(f.toLowerCase()));
        console.error("Numeric Fields auto-discovery error", e);
    }

    const suggestions: { field: string, value: string, confidence: number, source?: string, uiAction?: string }[] = [];

    // ------------------------------------------------------------------
    // STEP 1.5: Dynamic NLP Dictionary (results already loaded in parallel)
    // ------------------------------------------------------------------
    console.time("NLP");
    try {
        if (nlpEngine) {
            const doc = nlpEngine(cleanFullText);
            const tagsArray = doc.out('tags');
            if (tagsArray && tagsArray.length > 0 && tagsArray[0]) {
                Object.keys(tagsArray[0]).forEach(word => {
                    const wordTags: string[] = tagsArray[0][word];
                    const valueTag = wordTags.find((t: string) => t.endsWith('Value') && t !== 'Value');
                    if (valueTag) {
                        if ((valueTag === 'NumericValue' || valueTag === 'NumberValue') && !/\d/.test(word)) return;
                        const fieldName = valueTag.replace('Value', '');
                        const GARBAGE_FIELDS = ['numeric', 'general', 'value', 'number'];
                        if (GARBAGE_FIELDS.includes(fieldName.toLowerCase())) return;
                        suggestions.push({ field: fieldName, value: word, confidence: 0.95, source: 'COMPROMISE_NLP' });
                    }
                });
            }
        }
    } catch (e) {
        console.error("NLP parsing error in analyze:", e);
    }
    console.timeEnd("NLP");

    // Temporal Decay: signals ישנים מקבלים משקל נמוך יותר
    const allSignals = allSignalsRaw.map((s: any) => ({
        ...s,
        weight: s.weight * getTemporalDecay(s.updatedAt)
    }));
    const allContextPatterns = allContextPatternsRaw;


    // ⚡ O(1) Precomputations for Context (The Family Tree Maps) to prevent 30s latency!
    const contextMapById = new Map<string, any>();
    const fieldNodesByField = new Map<string, any[]>();
    const rootFamiliesByKey = new Map<string, any[]>();
    
    allContextPatternsRaw.forEach((p: any) => {
        contextMapById.set(p.id, p);
        if (p.type === "FIELD") {
            const arr = fieldNodesByField.get(p.patternPart) || [];
            arr.push(p);
            fieldNodesByField.set(p.patternPart, arr);
        }
        const rootKey = `${p.patternPart}___${p.type}`;
        const rootArr = rootFamiliesByKey.get(rootKey) || [];
        rootArr.push(p);
        rootFamiliesByKey.set(rootKey, rootArr);
    });

    // ------------------------------------------------------------------
    // STEP 1.75: Signal Engine — DB-driven signal matching (replaces hardcoded rules)
    // Runs AFTER Hebrew normalization, BEFORE Dictionary scan
    // ------------------------------------------------------------------
    try {
        // Phase A: Direct signal value matching
        const signalMatches = extractSignals(cleanFullText, allSignals);
        suggestions.push(...signalMatches);

        // Phase B: Dynamic number + unit binding (generic, no category rules)
        const unitBindings = bindNumbersToUnits(cleanFullText, allSignals);
        suggestions.push(...unitBindings);
    } catch (e) {
        console.error("Signal Engine error:", e);
    }

    let extractedBrand = "";
    let extractedModel = "";

    console.time("DICTIONARY");
    for (const record of allReliableValues) {
        const val = record.value.toLowerCase();
        if (cleanFullText.includes(val) || val.includes(cleanFullText)) {
            // Temporal Decay על הביטחון - ערכים ישנים שלא אושרו מאבדים משקל
            const decayFactor     = getTemporalDecay(record.updatedAt);
            const dynamicConfidence = Math.min(0.5 + ((record.occurrenceCount || 1) * 0.15), 1.0) * decayFactor;
            const finalConfidence   = Math.max(record.confidence * decayFactor, dynamicConfidence);
            
            // Anchor tagging for catalog search
            if (record.field === 'brand' && !extractedBrand) extractedBrand = record.value;
            if (record.field === 'model' && !extractedModel) extractedModel = record.value;

            suggestions.push({ field: record.field, value: record.value, confidence: finalConfidence, source: 'DICTIONARY' });
        }
    }
    console.timeEnd("DICTIONARY");

    // ------------------------------------------------------------------
    // STEP 3: Catalog Lookup & Constraints Intersection (Dynamic Mutability)
    // ------------------------------------------------------------------
    let catalogConstraints: any = null;
    let catalogBase: any = null;
    
    // Example tailored for Laptops based on Pipeline spec, easily expandable
    if (category === "LAPTOPS" && extractedBrand) {
        try {
            // OPTIMIZATION: Use dbCache to fetch the catalog per brand so it stays in RAM O(1)
            const brandKey = extractedBrand.toLowerCase().trim();
            const catRows = await dbCache.getOrFetch<any[]>(`laptop_catalog_${brandKey}`, () => 
                (prismadb as any).laptopCatalog.findMany({
                    where: { brand: { equals: extractedBrand, mode: 'insensitive' } }
                })
            );
            
            if (extractedModel && catRows.length > 0) {
                catalogBase = catRows.find((c: any) => c.modelName.toLowerCase().includes(extractedModel.toLowerCase())) || catRows[0];
            } else if (catRows.length > 0) {
                catalogBase = catRows[0];
            }

            if (catalogBase && catalogBase.constraints) {
                catalogConstraints = typeof catalogBase.constraints === 'string' ? JSON.parse(catalogBase.constraints) : catalogBase.constraints;
            }
        } catch(e) { console.error("Catalog check error", e); }
    }

    // ------------------------------------------------------------------
    // STEP 4 & 5: NLP, Fuzzy Matching, and Lineage (-2 / +2 Context Window)
    // ------------------------------------------------------------------
    const words = text.split(/\s+/);
    
    console.time("FUZZY");
    for (let i = 0; i < words.length; i++) {
        const rawWord = words[i].replace(/^[,"']+|[,"']+$/g, "");
        const word = rawWord.toLowerCase();
        if (word.length < 2) continue;
        
        // Phase A: Fuzzy (Levenshtein) Single Word Match
        for (const record of allReliableValues) {
            if (record.value.includes(" ")) continue; 
            const recordValLower = record.value.toLowerCase();
            // ⚡ EXTREME OPTIMIZATION: If length differs by >1, distance CANNOT be 1. Skip matrix entirely!
            if (Math.abs(word.length - recordValLower.length) > 1) continue; 
            
            const distance = getLevenshteinDistance(word, recordValLower);
            if (distance === 1 && word.length > 3) {
                const dynamicConfidence = Math.min(0.5 + ((record.occurrenceCount || 1) * 0.15), 1.0);
                suggestions.push({ field: record.field, value: record.value, confidence: Math.max(record.confidence, dynamicConfidence) * 0.8, source: 'FUZZY' });
            }
        }
    }
    console.timeEnd("FUZZY");

    console.time("DNA");
    for (let i = 0; i < words.length; i++) {
        const rawWord = words[i].replace(/^[,"']+|[,"']+$/g, "");
        const word = rawWord.toLowerCase();
        if (word.length < 2) continue;

        // Phase B: DNA Testing (The Ensamble/Community Graph)
        const preWords = [
            i >= 2 ? words[i - 2].replace(/^[,"']+|[,"']+$/g, "").toLowerCase() : null,
            i >= 1 ? words[i - 1].replace(/^[,"']+|[,"']+$/g, "").toLowerCase() : null
        ].filter(Boolean) as string[];
        
        const postWords = [
            i <= words.length - 2 ? words[i + 1].replace(/^[,"']+|[,"']+$/g, "").toLowerCase() : null,
            i <= words.length - 3 ? words[i + 2].replace(/^[,"']+|[,"']+$/g, "").toLowerCase() : null
        ].filter(Boolean) as string[];

        const preDna = [
            ...preWords, 
            preWords.join(" ")
        ].filter((c: string | null) => c && c.length > 1);

        const postDna = [
            ...postWords, 
            postWords.join(" ")
        ].filter((c: string | null) => c && c.length > 1);

        // helper to process dna lists
        const processDna = (dnaList: string[], requiredType: string) => {
            for (const dna of dnaList) {
                try {
                    const rootKey = `${dna}___${requiredType}`;
                    const rootFamilies = rootFamiliesByKey.get(rootKey) || [];

                for (const rootFamily of rootFamilies) {
                    if (rootFamily.children && rootFamily.children.length > 0) {
                        for (const child of rootFamily.children) {
                            if (child.type === "FIELD") {
                                const targetField = child.patternPart; // e.g. 'price'
                                const dnaConfidenceBoost = child.confidence || 0.5;

                                // If 'rawWord' is a number, the DNA directly assigns it to the targetField
                                if (rawWord.match(/^\d+(?:\.\d+)?$/) || rawWord.match(/^\d+(?:\.\d+)?[a-zא-ת]+$/i)) {
                                    let finalVal = rawWord;
                                    if (targetField === 'price') finalVal = rawWord.replace(/\D/g, ''); 
                                    suggestions.push({ field: targetField, value: finalVal, confidence: dnaConfidenceBoost, source: 'DNA_CONTEXT' });
                                } else {
                                    // It's a dictionary word conflict. Find the baseline suggestion and BOOST it (War of Families!)
                                    const existingSuggestion = suggestions.find(s => s.value === rawWord && s.field === targetField);
                                    if (existingSuggestion) {
                                        // Overpower! The family boosts the baseline word.
                                        existingSuggestion.confidence = Math.min(1.0, existingSuggestion.confidence + (dnaConfidenceBoost * 0.5));
                                        if (existingSuggestion.source === 'DICTIONARY' || existingSuggestion.source === 'FUZZY') {
                                            existingSuggestion.source = 'DNA_BOOSTED_DICTIONARY';
                                        } else {
                                            existingSuggestion.source = existingSuggestion.source!.includes('DNA_CONTEXT') ? existingSuggestion.source : 'DNA_CONTEXT';
                                        }
                                    } else {
                                        // Even if not firmly in dict, the strong DNA says it belongs here!
                                        suggestions.push({ field: targetField, value: rawWord, confidence: dnaConfidenceBoost * 0.8, source: 'DNA_CONTEXT_ONLY' });
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {}
        }
        }; // close processDna

        processDna(preDna, "PREFIX_ROOT");
        processDna(postDna, "SUFFIX_ROOT");
    }
    console.timeEnd("DNA");

    // ------------------------------------------------------------------
    // STEP 6: Catalog Overrides & Conflict Resolution 
    // ------------------------------------------------------------------
    if (catalogConstraints && catalogConstraints.limits) {
        // Evaluate RAM limitation explicitly as requested in the E2E architecture
        const ramLimits = catalogConstraints.limits.ram;
        if (ramLimits && ramLimits.max) {
            const huntedRams = suggestions.filter(s => s.field === 'ram');
            for (const r of huntedRams) {
                const num = parseInt(r.value.replace(/\D/g, ''));
                if (!isNaN(num) && num > ramLimits.max) {
                    r.uiAction = "CONFLICT_CATALOG"; // Forces red layout in UI dynamically
                    r.source = "CATALOG_LIMITS";
                }
            }
        }
    }

    // Combine Similarity & De-Duplication (Community Graph Aggregation)
    // 1. קודם מרכזים עדויות לאותו (שערך + שדה)
    const hypothesisMap = new Map();
    const distinctFieldsArr: string[] = []; // O(1) Cache

    suggestions.forEach(s => {
        let matchedField = s.field;
        
        if (distinctFieldsArr.length > 0) {
            // הדימיון מתבצע אך ורק על המערך המוכן - מונע TLE והקפאת שרת!
            const bestMatch = stringSimilarity.findBestMatch(s.field, distinctFieldsArr);
            if (bestMatch.bestMatch.rating >= 0.85) matchedField = bestMatch.bestMatch.target;
        }

        const hypothesisKey = `${matchedField}___${s.value.toLowerCase()}`;
        const existing = hypothesisMap.get(hypothesisKey);
        
        if (!existing) {
            hypothesisMap.set(hypothesisKey, { ...s, field: matchedField });
            if (!distinctFieldsArr.includes(matchedField)) {
                distinctFieldsArr.push(matchedField);
            }
        } else {
            // THE WAR OF FAMILIES REWARD: Aggregating multiple community DNA hits for the EXACT SAME hypothesis
            if (s.uiAction === "CONFLICT_CATALOG") existing.uiAction = "CONFLICT_CATALOG";
            
            // Asymptotic Probability Addition
            const remainingDoubt = 1.0 - existing.confidence;
            existing.confidence = existing.confidence + (remainingDoubt * s.confidence);
            existing.source = existing.source + ' + ' + s.source;
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // STEP 5.5: Family Affinity Pass — Return to Source
    // בעיה: "עולה" יכול להיות price(0.95) ו-temperature(0.85) — שניהם דיכשנרי גבוה
    // פתרון: חוזרים למשפחה שיצרה כל שדה ב-ContextPattern
    //         ובודקים אחים (PREFIX_ROOT) קיימים בטקסט הנוכחי.
    //         המשפחה עם הכי הרבה אחים בטקסט → BOOST אסימפטוטי
    //         ענישה: משפחה עם אפס אחים בטקסט לא מקבלת חיזוק
    // ═══════════════════════════════════════════════════════════════
    const textForFamily = cleanFullText.toLowerCase();
    const familyAffinityCache = new Map<string, number>(); // field → affinity

    for (const [, hypo] of hypothesisMap) {
        const cacheKey = hypo.field;
        if (!familyAffinityCache.has(cacheKey)) {
            familyAffinityCache.set(
                cacheKey,
                computeFamilyAffinity(hypo.field, textForFamily, fieldNodesByField, contextMapById)
            );
        }
        const affinity = familyAffinityCache.get(cacheKey)!;
        if (affinity > 0.05) {
            // Asymptotic boost: max 40% מהספק הנותר
            hypo.confidence = hypo.confidence + (1 - hypo.confidence) * affinity * 0.40;
            hypo.source = (hypo.source ?? '') + '+FAMILY_AFFINITY';
        }
    }

    // 2. עכשיו, מקרב ההשערות השונות לאותו שדה, בוחרים את המנצח (או מעדיפים מספרים על פני טקסט בשדות כמותיים)
    const finalMap = new Map();

    hypothesisMap.forEach(hypo => {
        const existingBest = finalMap.get(hypo.field);
        
        if (!existingBest) {
            finalMap.set(hypo.field, hypo);
        } else {
            // ה-AI קורא מתוך הסורק האוטונומי שלנו אם השדה הזה סומן כמספרי!
            const isNumericField = numericFields.has(hypo.field.toLowerCase());
            const hypoIsNum = /\d/.test(hypo.value);
            const existIsNum = /\d/.test(existingBest.value);

            let replace = false;
            
            // חוקי ניצחון:
            if (isNumericField) {
                // בשדה נומרי: אם אחד מספר והשני לא - המספר מיד מנצח!
                if (hypoIsNum && !existIsNum) replace = true;
                // אם שניהם מספרים, המנצח הוא בעל הביטחון הגבוה יותר
                else if (hypoIsNum && existIsNum && hypo.confidence > existingBest.confidence) replace = true;
            } else {
                // בשדה טקסטואלי: בעל הביטחון הגבוה יותר לוקח. אם הם קרובים, טקסט ארוך יותר מנצח.
                if (hypo.confidence > existingBest.confidence + 0.1) replace = true;
                else if (Math.abs(hypo.confidence - existingBest.confidence) <= 0.1 && hypo.value.length > existingBest.value.length && hypo.source !== 'DNA_CONTEXT_ONLY') replace = true;
            }

            if (replace) {
                finalMap.set(hypo.field, hypo);
            }
        }
    });

    // 🛡️ הגנת אימות סופית (הפחתת ביטחון מסיבית לטקסט חי בשדות מספר שזוהו אוטונומית)
    finalMap.forEach(finalRes => {
        if (numericFields.has(finalRes.field.toLowerCase()) && !/\d/.test(finalRes.value)) {
            finalRes.confidence = finalRes.confidence * 0.2;
        }
    });

    // ------------------------------------------------------------------
    // STEP 7: Final Action Generation (Thresholds execution)
    // ------------------------------------------------------------------
    // 🛡️ מחיקת שדות כלליים עודפים: 
    // אם המנוע הצליח לשייך מספר לשדה רשמי (כמו השמת 512 לתוך storage), 
    // ובו זמנית מנוע ה-NLP הכללי גם פלט "Numeric: 512" כשדה חיצוני מחוסר מודעות - נמחק את הכפילות המיותרת!
    const validFieldValues = Array.from(finalMap.values())
        .filter(r => r.field.toLowerCase() !== 'numeric' && r.field.toLowerCase() !== 'general')
        .map(r => r.value.toLowerCase());

    const keysToDelete: string[] = [];
    finalMap.forEach(finalRes => {
        if ((finalRes.field.toLowerCase() === 'numeric' || finalRes.field.toLowerCase() === 'general') 
            && validFieldValues.includes(finalRes.value.toLowerCase())) {
            keysToDelete.push(finalRes.field);
        }
    });
    keysToDelete.forEach(k => finalMap.delete(k));

    const finalResults = Array.from(finalMap.values()).map(s => {
        let action = s.uiAction || "NONE";
        
        // If it's a conflict, it overrides the standard AI fill logic
        if (action === "CONFLICT_CATALOG") return { ...s, action };

        const limits = thresholdMap.get(s.field);
        const globalFill = config?.thresholds?.global_fill ?? 0.85;
        const globalSuggest = config?.thresholds?.global_suggest ?? 0.45;

        const fieldThreshold = limits?.threshold ?? globalFill;
        const fieldMargin = limits?.margin ?? (fieldThreshold - globalSuggest);

        if (s.confidence >= fieldThreshold) action = "AUTO_FILL";
        else if (s.confidence >= (fieldThreshold - fieldMargin)) action = "SUGGEST";

        return { ...s, action };
    }).filter(s => s.action !== "NONE");

    console.log("STATS:");
    console.log("Words count:", words.length);
    console.log("Reliable values:", allReliableValues.length);
    console.log("Context patterns:", allContextPatterns.length);
    console.log("Form fields:", formStructsCount);
    console.log("Field options:", fieldOptionsCount);
    
    console.timeEnd("TOTAL_ANALYZE");

    return finalResults;
}

// ⚠️ masterLearn is defined in lib/learning.ts 
// DO NOT redefine here.