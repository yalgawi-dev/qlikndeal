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
    
    if (normalizedCategory === "MOBILES" || normalizedCategory === "MOBILE") normalizedCategory = "PHONES";
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
    if (!category || category === "" || category === "undefined" || category === "UNKNOWN") {
        // Use the smarter detectCategory (Hebrew regex heuristics) over the weak Bayesian classifier
        const detected = await detectCategory(safeQuery);
        category = detected !== "UNKNOWN" ? detected : await classifyCategory(safeQuery);
    }
    console.log("📂 CATEGORY:", Date.now() - t1, "ms");


    // יישור קו גורף לקטגוריות המערכת
    const normalizationMap: Record<string, string> = {
        "MOBILES": "PHONES",
        "MOBILE": "PHONES",
        "PHONE": "PHONES",
        "LAPTOP": "LAPTOPS",
        "COMPUTER": "DESKTOPS",
        "PC": "DESKTOPS",
        "DESKTOP": "DESKTOPS",
        "CAR": "VEHICLES",
        "VEHICLE": "VEHICLES"
    };

    if (category && normalizationMap[category.toUpperCase()]) {
        category = normalizationMap[category.toUpperCase()];
    }

    // קריאה לניתוח הנתונים
    const t2 = Date.now();
    const aiResults = await masterAnalyze(safeQuery, category || "UNKNOWN");
    console.log("🧠 ANALYZE:", Date.now() - t2, "ms");
    const result: any = { category, suggestions: aiResults };

    // הזרקת השדות לתוצאה הסופית + סנכרון עם התפריט הנגלל (Dropdown Snapping)
    const t3 = Date.now();
    const categoryOptions = await dbCache.getOrFetch<any[]>(`opts_${category || "GENERAL"}`, () => 
        prismadb.formFieldOption.findMany({ where: { category: category || "GENERAL" } })
    );
    console.log("📊 OPTIONS FETCH:", Date.now() - t3, "ms");

    // ⚡ PRELOAD FIELDS (Performance Optimization to avoid N DB queries blocking the loop for 25s)
    let preloadedDbFields: string[] = [];
    try {
        let preCategory = (category || "GENERAL").toUpperCase();
        if (preCategory === "MOBILES" || preCategory === "MOBILE") preCategory = "PHONES";
        if (preCategory === "LAPTOP") preCategory = "LAPTOPS";
        if (preCategory === "COMPUTER" || preCategory === "PC") preCategory = "DESKTOPS";
        const preFieldsRaw = await dbCache.getOrFetch<any[]>(`fields_${preCategory}`, () => 
            prismadb.fieldValueReliability.findMany({
                where: { category: preCategory },
                select: { field: true },
                distinct: ['field']
            })
        );
        preloadedDbFields = preFieldsRaw.map((f: any) => f.field);
    } catch(e) {}

    // 🔑 KEY FIX: build mapped suggestions so frontend fieldId matching works
    const t4 = Date.now();
    const mappedSuggestions: any[] = [];

    for (const res of aiResults) {
        if ((res.action === "AUTO_FILL" || res.action === "SUGGEST") && res.field) {
            const targetField = await mapFieldToSchema(res.field, category || "GENERAL", preloadedDbFields);
            let finalValue = res.value;

            // בדיקה האם קיים תפריט נגלל לשדה הזה
            const optionsForField = categoryOptions.filter(o => o.fieldId === targetField);
            if (optionsForField.length > 0) {
                // Snap to option's ORIGINAL case — e.g. "32gb" → "32GB", "intel core ultra 7 258v" → "Intel Core Ultra 7 258V"
                const exactMatch = optionsForField.find(o => o.value.toLowerCase() === String(finalValue).toLowerCase());
                if (exactMatch) {
                    // ✅ CRITICAL: use the option's original case, not the lowercase AI value!
                    finalValue = exactMatch.value;
                } else {
                    // Partial numeric match: "1tb" → "1TB SSD", "512" → "512GB SSD"
                    const partialMatch = optionsForField.find(o => {
                        const optLower = o.value.toLowerCase();
                        const valLower = String(finalValue).toLowerCase();
                        if (/\d/.test(valLower) && /\d/.test(optLower)) {
                            return optLower.includes(valLower) || valLower.includes(optLower);
                        }
                        // Text match for fields like condition: "חדש" inside "חדש באריזה"
                        if (valLower.length >= 2) {
                            return optLower.startsWith(valLower) || valLower.startsWith(optLower);
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