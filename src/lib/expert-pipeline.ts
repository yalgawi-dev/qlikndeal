import * as natural from 'natural';
import * as fs from 'fs';
import path from 'path';
import prismadb from './prismadb';
import { masterAnalyze } from './analyze';
import Fuse from 'fuse.js';
import { detectCategory } from './matcher-core';
import { dbCache } from './db-cache';

const CONFIG_PATH = path.join(process.cwd(), "src/config/matcher-config.json");

/**
 * 1. מיפוי שדות דינמי - מתואם לשמות ב-Schema שלך
 */
async function mapFieldToSchema(aiField: string, category: string, preloadedDbFields?: string[]): Promise<string> {
    let normalizedCategory = category.toUpperCase();
    
    if (normalizedCategory === "MOBILES" || normalizedCategory === "MOBILE" || normalizedCategory === "PHONES" || normalizedCategory === "PHONE") normalizedCategory = "SMARTPHONES";
    if (normalizedCategory === "LAPTOP") normalizedCategory = "LAPTOPS";
    if (normalizedCategory === "COMPUTER" || normalizedCategory === "PC") normalizedCategory = "DESKTOPS";

    try {
        let dbFields = preloadedDbFields;
        if (!dbFields) {
            const dbFieldsRaw = await prismadb.fieldValueReliability.findMany({
                where: { category: normalizedCategory },
                select: { field: true },
                distinct: ['field']
            });
            dbFields = dbFieldsRaw.map(f => f.field);
        }
        
        const exactMatch = dbFields.find(f => f.toLowerCase() === aiField.toLowerCase());
        if (exactMatch) return exactMatch;

        if (dbFields.length > 0) {
            const fuse = new Fuse(dbFields.map(f => ({ name: f })), { keys: ['name'], threshold: 0.5 });
            const match = fuse.search(aiField);
            if (match.length > 0) return (match[0].item as any).name;
        }
    } catch (e) {
        console.error("Field mapping error:", e);
    }
    return aiField;
}

/**
 * 2. סיווג קטגוריה - כולל הגנה מפני אובייקטים (תיקון TypeError)
 */
export async function classifyCategory(query: any): Promise<string> {
    // הגנה קריטית: וודא שהשאילתה היא מחרוזת בלבד
    const safeQuery = typeof query === 'string' ? query : String(query || "");
    
    if (!safeQuery || safeQuery.trim().length === 0) {
        return "UNKNOWN";
    }

    const classifier = new natural.BayesClassifier();
    
    // אימון המערכת על השמות המאוחדים שלנו
    classifier.addDocument('אייפון סמסונג טלפון סלולרי נייד גלקסי iphone samsung galaxy mobile', 'PHONES');
    classifier.addDocument('לפטופ מחשב נייד נייח מעבד מקבוק pc desktop laptop macbook', 'LAPTOPS');
    classifier.addDocument('רכב מכונית אוטו טויוטה יונדאי קורולה car toyota hyundai car', 'VEHICLES');
    
    classifier.train();
    
    try {
        const classifications = classifier.getClassifications(safeQuery);
        if (!classifications || classifications.length === 0) return "UNKNOWN";

        const bestMatch = classifications[0];
        
        let configThreshold = 0.40;
        if (fs.existsSync(CONFIG_PATH)) {
            try {
                const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
                configThreshold = config.thresholds?.category_unknown_limit || 0.40;
            } catch(e) {}
        }
        
        return bestMatch.value >= configThreshold ? bestMatch.label : "UNKNOWN";
    } catch (err) {
        console.error("Natural classifier error:", err);
        return "UNKNOWN";
    }
}

/**
 * 3. הצינור המרכזי - הלב של המערכת
 */
export async function expertFeedbackPipeline(query: any, existingCategory?: string) {
    const start = Date.now();
    console.log("🚀 PIPELINE START");
    console.log("🔥 expertPipeline CALLED");

    // וידוא שהטקסט נקי לפני הכל
    const safeQuery = typeof query === 'string' ? query : String(query || "");
    
    let category = existingCategory;

    // שלב הניקוי ויישור הקו (Normalization)
    const t1 = Date.now();
    
    // CRITICAL FIX: If the user explicitly chose a category (e.g. LAPTOPS), respect it!
    // Only run detectCategory when no category is provided or it's UNKNOWN/GENERAL.
    const userHasCategory = existingCategory && existingCategory !== '' && existingCategory !== 'undefined' && existingCategory !== 'UNKNOWN' && existingCategory !== 'GENERAL';
    if (!userHasCategory) {
        const detected = await detectCategory(safeQuery);
        if (detected !== "UNKNOWN") {
            category = detected;
        } else {
            category = await classifyCategory(safeQuery);
        }
    }
    console.log("📂 CATEGORY:", Date.now() - t1, "ms", "→", category);


    // יישור קו גורף (UI to DB Translation Pipeline)
    // The UI uses 'SMARTPHONES', but the Dictionary / Candles use 'PHONES'
    const normalizationMap: Record<string, string> = {
        "MOBILES": "SMARTPHONES",
        "MOBILE": "SMARTPHONES",
        "PHONE": "SMARTPHONES",
        "PHONES": "SMARTPHONES",
        "LAPTOP": "LAPTOPS",
        "COMPUTER": "DESKTOPS",
        "PC": "DESKTOPS",
        "DESKTOP": "DESKTOPS",
        "CAR": "VEHICLES",
        "VEHICLE": "VEHICLES"
    };

    let targetDbCategory = category;
    if (targetDbCategory && normalizationMap[targetDbCategory.toUpperCase()]) {
        targetDbCategory = normalizationMap[targetDbCategory.toUpperCase()];
    }

    // קריאה לניתוח הנתונים באמצעות הקטגוריה המותאמת ל-DB (למשל PHONES)
    const t2 = Date.now();
    const aiResults = await masterAnalyze(safeQuery, targetDbCategory || "UNKNOWN");
    console.log("🧠 ANALYZE:", Date.now() - t2, "ms");
    
    // החזרה לפרונטאנד במונחי UI
    const uiReturnCategory = targetDbCategory;
    const result: any = { category: uiReturnCategory, suggestions: aiResults };

    // הזרקת השדות לתוצאה הסופית + סנכרון עם התפריט הנגלל (Dropdown Snapping)
    const t3 = Date.now();
    const categoryOptions = await dbCache.getOrFetch<any[]>(`opts_${category || "GENERAL"}`, () => 
        prismadb.formFieldOption.findMany({ where: { category: category || "GENERAL" } })
    );
    console.log("📊 OPTIONS FETCH:", Date.now() - t3, "ms");

    // ⚡ PRELOAD FIELDS (Performance Optimization to avoid N DB queries blocking the loop for 25s)
    let preloadedDbFields: string[] = [];
    try {
        let preCategory = (targetDbCategory || "GENERAL").toUpperCase();
        const preFieldsRaw = await dbCache.getOrFetch<any[]>(`fields_${preCategory}`, () => 
            prismadb.fieldValueReliability.findMany({
                where: { category: preCategory },
                select: { field: true },
                distinct: ['field']
            })
        );
        preloadedDbFields = preFieldsRaw.map((f: any) => f.field);
    } catch(e) {}

    // ── CROSS-LANGUAGE FIELD ALIASES (Pipeline Level) ───────────────────────
    // ה-AI לומד שמות שדות כמו "series" / "סדרה", אבל ה-formStructure משתמש
    // ב-fieldId שונה (ערך "family" ב-LAPTOPS). טוענים ה-formStructure fieldIds מה-Cache
    // (memoized - כבר נטען על ידי masterAnalyze, אפס hits חדשים) ומבצעים Alias-Resolve דינמי.
    let formStructFieldIds: string[] = [];
    try {
        const formStructRaw = await dbCache.getOrFetch<any[]>(`structs_${targetDbCategory || 'GENERAL'}`, () =>
            prismadb.categoryFormStructure.findMany({ where: { category: targetDbCategory || 'GENERAL' } })
        );
        formStructFieldIds = formStructRaw.map((r: any) => r.fieldId);
    } catch(e) { console.warn('[pipeline] Could not load formStruct fieldIds:', e); }

    // מפד כינויים רב-לשוני ורב-שמותי: אנגלית/עברית → fieldId קנוני בטופס
    const GLOBAL_FIELD_ALIASES: Record<string, string> = {
        "series":  "family",       // EN anchor → "family" (LAPTOPS: סדרת יצרן)
        "סדרה":   "family",        // HE anchor → אותו fieldId
        "model":   "subModel",     // AI internal field → UI field
        "modelname": "subModel",   // AI internal field → UI field
        "דגם":     "subModel",     // HE anchor → UI field
    };
    // helper: מחיל alias רק אם ה-targetFieldId קיים ב-formStructure
    const resolveFieldAlias = (fieldName: string): string => {
        const alias = GLOBAL_FIELD_ALIASES[fieldName] ?? GLOBAL_FIELD_ALIASES[fieldName.toLowerCase()];
        if (alias && formStructFieldIds.includes(alias)) return alias;
        return fieldName;
    };

    // Load dynamically learned ALIASes from FieldSignal
    let dynamicAliases: any[] = [];
    try {
        const catOrGen = category || "GENERAL";
        dynamicAliases = await dbCache.getOrFetch<any[]>(`ai_alias_${catOrGen}`, () => 
            prismadb.fieldSignal.findMany({ 
                where: { category: catOrGen, signalType: "ALIAS", isIgnored: false }
            })
        );
    } catch(e) { console.warn("[pipeline] Could not load dynamic aliases:", e); }

    const dynamicAliasMap: Record<string, string> = {};
    for (const a of dynamicAliases) {
        if (a.rawValue && a.normalized) {
            dynamicAliasMap[a.rawValue.toLowerCase().trim()] = a.normalized.trim();
        }
    }

    // 🔑 KEY FIX: build mapped suggestions so frontend fieldId matching works
    const t4 = Date.now();
    const mappedSuggestions: any[] = [];

    for (const res of aiResults) {
        if ((res.action === "AUTO_FILL" || res.action === "SUGGEST") && res.field) {
            // GUARD: skip non-product meta-fields – they cause Fuse false-positives
            const META_FIELDS = ['price', 'title', 'description', 'category', 'contactPhone', 'suggestions', 'success'];
            if (META_FIELDS.includes(res.field.toLowerCase())) continue;

            // נורמליזציה ערב-אנגלית: "series"/"סדרה" → "family" (כאשר קיים ב-formStructure)
            const normalizedResField = resolveFieldAlias(res.field);
            const targetField = await mapFieldToSchema(normalizedResField, category || "GENERAL", preloadedDbFields);
            let finalValue = res.value;

            // AI (like Claude/OpenAI) often replaces spaces with underscores in JSON values (e.g. "Windows_11_Home")
            // This breaks exact string matching with DB options ("Windows 11 Home")
            if (typeof finalValue === 'string') {
                finalValue = finalValue.replace(/_/g, ' ');
            }

            // ─── CROSS-LANGUAGE VALUE ALIASES (DB Canonicalization) ────────────────
            // Translates Hebrew spoken brands/OS directly into English DB catalog keys
            // solving the "catalog cascade break" when UI gets "לנובו" instead of "Lenovo"
            const GLOBAL_VALUE_ALIASES: Record<string, string> = {
                "לנובו": "Lenovo",
                "אסוס": "Asus",
                "דל": "Dell",
                "סמסונג": "Samsung",
                "הייסנס": "Hisense",
                "אלגי": "LG",
                "אלג'י": "LG",
                "אל ג'י": "LG",
                "שיאומי": "Xiaomi",
                "סוני": "Sony",
                "פיליפס": "Philips",
                "פנסוניק": "Panasonic",
                "איסר": "Acer",
                "אייסר": "Acer",
                "מייקרוסופט": "Microsoft",
                "רייזר": "Razer",
                "גיגבייט": "Gigabyte",
                "msi": "MSI",
                "חלונות": "Windows",
                "וינדוס": "Windows",
                "ווינדוס": "Windows",
                "מק": "macOS",
            };

            const rawLower = String(finalValue).toLowerCase().trim();
            if (dynamicAliasMap[rawLower]) {
                // Self-learning dynamic DB aliases override manual list!
                finalValue = dynamicAliasMap[rawLower];
            } else if (GLOBAL_VALUE_ALIASES[rawLower]) {
                finalValue = GLOBAL_VALUE_ALIASES[rawLower];
            } else if (rawLower === 'אפל' || rawLower === 'מקינטוש') {
                finalValue = targetField === 'os' ? 'macOS' : 'Apple';
            }

            // בדיקה האם קיים תפריט נגלל לשדה הזה
            const optionsForField = categoryOptions.filter(o => o.fieldId === targetField);
            if (optionsForField.length > 0) {
                // Snap to option's ORIGINAL case — e.g. "32gb" → "32GB"
                const exactMatch = optionsForField.find(o => o.value.toLowerCase() === String(finalValue).toLowerCase());
                if (exactMatch) {
                    finalValue = exactMatch.value;
                } else {
                    // ─── ANTI-HALLUCINATION CONTRACT ─────────────────────────────────
                    // The snap layer may ONLY normalize form — it must NEVER add information
                    // that was not explicitly present in the original text.
                    //
                    // ✅ ALLOWED (canonical form reduction):
                    //   extracted "1tb"  → option "1TB SSD"    (adds unit suffix only, not a new spec)
                    //   extracted "32gb" → option "32GB RAM"   (adds unit suffix only)
                    //   extracted "Intel Core Ultra 7 165H" → option "Intel Core Ultra 7 165H" (exact)
                    //
                    // ❌ PROHIBITED (hallucination / expansion to more-specific):
                    //   extracted "Intel Core Ultra 7" → option "Intel Core Ultra 7 165H"  ← NEVER
                    //   extracted "32" → option "32GB RAM"  (too ambiguous — 32 could be anything)
                    //
                    // RULE: an option is acceptable only if:
                    //   (a) what we extracted CONTAINS the option text (we are more specific), OR
                    //   (b) what we extracted is a SHORT numeric code (≤6 chars like "1tb", "32gb")
                    //       AND the option merely adds a unit suffix (first token matches).
                    // ─────────────────────────────────────────────────────────────────
                    const partialMatch = optionsForField.find(o => {
                        const optLower = o.value.toLowerCase();
                        const valLower = String(finalValue).toLowerCase();

                        // (a) Extracted ⊇ Option  (we compress to canonical base form)
                        if (valLower.length > 0 && optLower.length > 0 && valLower.includes(optLower)) {
                            // 🚨 ANTI HALLUCINATION SHIELD (Single Letters)
                            // Prevent "G15" from partially matching the family "G" 
                            if (optLower.length <= 2 && optLower !== valLower) return false;
                            return true;
                        }

                        // (b) Short numeric shorthand → unit expansion
                        //     Allow: "1tb" → "1TB SSD", "32gb" → "32GB RAM"
                        if (
                            valLower.length >= 2 &&
                            valLower.length <= 6 &&
                            /^\d+[a-z]{1,3}$/i.test(valLower) && // must have unit letters (gb, tb, mb…)
                            /\d/.test(optLower) &&
                            optLower.includes(valLower)
                        ) return true;

                        // (c) ContextAwareParser (Navigation in the Dark)
                        // It extracts pure numbers highly confidently because it uses anchors.
                        // If it extracted "32" (for RAM field), it is safe to snap to "32GB RAM".
                        // MUST ensure "32" doesn't falsely snap to "320GB" (use lookahead for non-digit).
                        if (/^\d+$/.test(valLower)) {
                            const exactNumberMatch = new RegExp(`(?:^|\\D)${valLower}(?!\\d)`, 'i');
                            if (exactNumberMatch.test(optLower)) return true;
                        }

                        // (d) Substring overlap with word bounds (e.g. "i7" -> "Intel Core i7")
                        // "valLower" is text. We check if the DB option contains it as a distinct word.
                        if (!/^\d+$/.test(valLower) && valLower.length >= 2) {
                            const escapedVal = valLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const wordBoundRegex = new RegExp(`(^|[\\s,.-])${escapedVal}($|[\\s,.-])`, 'i');
                            if (wordBoundRegex.test(optLower)) return true;
                        }

                        // (e) Screen/size numeric prefix match: "14 full hd" → "14""
                        // Extracts numeric prefix and compares to size option ignoring the inch mark
                        if (/^\d/.test(valLower)) {
                            const numMatch = valLower.match(/^(\d+(?:\.\d+)?)/);
                            if (numMatch) {
                                const numPart = numMatch[1];
                                // Strip all quote/inch chars and compare
                                const cleanOpt = optLower.replace(/["\u201c\u201d\u2019\u2018]/g, '').trim();
                                if (cleanOpt === numPart) return true;
                            }
                        }

                        return false;
                    });
                    if (partialMatch) finalValue = partialMatch.value;
                }
            }
            
            result[targetField] = finalValue;
            // ✅ Push suggestion with MAPPED field name (so frontend can match formStructure.fieldId)
            mappedSuggestions.push({ ...res, field: targetField, originalField: res.field, value: finalValue });
        } else {
            mappedSuggestions.push(res);
        }
    }

    // Replace raw suggestions with field-mapped ones
    result.suggestions = mappedSuggestions;
    
    console.log("🧩 MAPPING:", Date.now() - t4, "ms");

    // Next.js ממתין לכל ה-Promises לפני שחרור התשובה ללקוח. הלוגיקה פה כפולה ומיותרת (הפרונט מדווח בעצמו דרך api/parser-log) ורוצחת את הביצועים.
    // הוסר `userCorrection.create` ו-`fs.writeFileSync` הבלוקינג!
    
    const tEnd = Date.now();
    console.log("🏁 PIPELINE TOTAL:", tEnd - start, "ms");

    return result;
}