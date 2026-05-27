import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

// Levenshtein distance
function editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) {
            costs[s2.length] = lastValue;
        }
    }
    return costs[s2.length];
}

function similarity(s1: string, s2: string): number {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    return (longerLength - editDistance(longer, shorter)) / longerLength;
}

// Transliterations dictionary
const TRANSLITERATIONS: Record<string, string> = {
    "שיאומי": "xiaomi", "שיומי": "xiaomi", "xiomi": "xiaomi", "xaiomi": "xiaomi", "xiaomy": "xiaomi",
    "סמסונג": "samsung", "סמסונק": "samsung", "samsum": "samsung", "samsng": "samsung", "גלכסי": "galaxy",
    "גלקסי": "galaxy", "גאלקסי": "galaxy", "galaxi": "galaxy", "glaxy": "galaxy", "גאלכסי": "galaxy",
    "אייפון": "iphone", "איפון": "iphone", "iphon": "iphone", "iphne": "iphone",
    "אפל": "apple", "aple": "apple",
    "רדמי": "redmi", "redmie": "redmi", "radmi": "redmi",
    "אסוס": "asus", "דל": "dell", "dall": "dell", "דאל": "dell",
    "לנובו": "lenovo", "הואווי": "huawei", "נוקיה": "nokia", "ריאלמי": "realme",
    "פוקו": "poco", "פרו": "pro", "נוט": "note", "אולטרה": "ultra", "אולטרא": "ultra",
    "אייר": "air", "בוק": "book", "טאבלט": "tablet", "מקבוק": "macbook"
};

const BRAND_GROUPS: Record<string, string[]> = {
    xiaomi: ["xiaomi", "xiomi", "xaiomi", "xiaomy", "שיאומי", "שיומי", "redmi", "רדמי", "poco", "פוקו"],
    samsung: ["samsung", "סמסונג", "samsum", "samsng", "galaxy", "גלקסי", "גאלקסי", "גאלכסי", "גלכסי"],
    apple: ["apple", "אפל", "aple", "iphone", "אייפון", "איפון", "ipad", "אייפד", "macbook", "מקבוק"],
    asus: ["asus", "אסוס"],
    dell: ["dell", "dall", "דל", "דאל"],
    lenovo: ["lenovo", "לנובו"],
    hp: ["hp", "hewlett", "אייצ פי", "הייץ פי"],
    acer: ["acer", "אייסר"],
    google: ["google", "גוגל", "pixel", "פיקסל"],
    oneplus: ["oneplus", "ונפלוס", "וואן פלוס", "וונפלוס"],
    realme: ["realme", "ריאלמי"],
    oppo: ["oppo", "אופו"]
};

// Normalize a word and expand it with matching transliteration forms (including prefix matches for autocomplete)
function getNormalizedForms(word: string): string[] {
    const w = word.toLowerCase().trim();
    const forms = new Set<string>([w]);
    
    // Direct translation
    if (TRANSLITERATIONS[w]) {
        forms.add(TRANSLITERATIONS[w]);
    }
    
    // Prefix match translation (e.g., "שיו" is a prefix of "שיומי" -> adds "xiaomi" and "שיומי")
    if (w.length >= 2) {
        for (const [key, val] of Object.entries(TRANSLITERATIONS)) {
            if (key.startsWith(w)) {
                forms.add(val);
                forms.add(key);
            }
        }
    }
    
    // Strip common Hebrew prefixes (e.g. ה, ב, כ, ל, מ, ש, ה) if the word starts with them and is longer than 3 chars
    if (w.length > 3 && (w.startsWith("ה") || w.startsWith("ב") || w.startsWith("ל") || w.startsWith("כ"))) {
        const stripped = w.slice(1);
        if (TRANSLITERATIONS[stripped]) {
            forms.add(TRANSLITERATIONS[stripped]);
        }
        for (const [key, val] of Object.entries(TRANSLITERATIONS)) {
            if (key.startsWith(stripped)) {
                forms.add(val);
                forms.add(key);
            }
        }
    }
    
    return Array.from(forms);
}

// Tokenize a string into cleaned words
function getTokens(str: string): string[] {
    if (!str) return [];
    // Replace punctuation and special chars with spaces
    const clean = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\\\[\]]/g, " ");
    return clean.split(/\s+/).filter(w => w.length > 0).map(w => w.toLowerCase());
}

function isKeywordMatch(token: string, keyword: string): boolean {
    const t = token.toLowerCase().trim();
    const k = keyword.toLowerCase().trim();
    
    if (t === k) return true;
    if (getNormalizedForms(t).includes(k)) return true;
    
    // Fuzzy matching for typo tolerance on brand names
    if (t.length >= 4 && k.length >= 4) {
        if (similarity(t, k) >= 0.75) {
            return true;
        }
    }
    
    return false;
}

function getMentionedBrandGroups(qTokens: string[]): string[] {
    const mentionedGroups: string[] = [];
    for (const qToken of qTokens) {
        for (const [groupName, keywords] of Object.entries(BRAND_GROUPS)) {
            const isMatch = keywords.some(k => isKeywordMatch(qToken, k));
            if (isMatch) {
                if (!mentionedGroups.includes(groupName)) {
                    mentionedGroups.push(groupName);
                }
            }
        }
    }
    return mentionedGroups;
}

// Brand constraint verification to prevent cross-brand matching
function verifyBrandConstraint(mentionedGroups: string[], candidateText: string): boolean {
    if (mentionedGroups.length === 0) return true;
    
    const candTokens = getTokens(candidateText);
    const hasBrandMatch = candTokens.some(ct => {
        return mentionedGroups.some(groupName => {
            const keywords = BRAND_GROUPS[groupName];
            return keywords.some(k => isKeywordMatch(ct, k));
        });
    });
    
    return hasBrandMatch;
}

function getCleanLabel(brand: string, series: string | null | undefined, modelName: string): string {
    const b = (brand || "").trim();
    const s = (series || "").trim();
    const m = (modelName || "").trim();
    
    let label = "";
    if (b) {
        label += b;
    }
    
    if (s) {
        const cleanSeries = s.toLowerCase().startsWith(b.toLowerCase())
            ? s.slice(b.length).trim()
            : s;
        if (cleanSeries) {
            label += (label ? " " : "") + cleanSeries;
        }
    }
    
    if (m) {
        const brandLower = b.toLowerCase();
        const seriesLower = s.toLowerCase();
        const modelLower = m.toLowerCase();
        
        let cleanModel = m;
        const brandSeries = `${b} ${s}`.trim().toLowerCase();
        
        if (brandSeries && modelLower.startsWith(brandSeries)) {
            cleanModel = m.slice(brandSeries.length).trim();
        } else if (s && modelLower.startsWith(seriesLower)) {
            cleanModel = m.slice(s.length).trim();
        } else if (b && modelLower.startsWith(brandLower)) {
            cleanModel = m.slice(b.length).trim();
        }
        
        if (cleanModel) {
            label += (label ? " " : "") + cleanModel;
        }
    }
    
    return label.trim();
}

function scoreCandidate(query: string, candidateText: string, mentionedGroups: string[]): number {
    const qTokens = getTokens(query);
    const candTokens = getTokens(candidateText);
    
    if (qTokens.length === 0) return 0;

    // Apply Brand Constraint Check first!
    if (!verifyBrandConstraint(mentionedGroups, candidateText)) {
        return 0; // Filter out completely
    }

    let totalScore = 0;
    
    // Check if numbers in the query are matched in the candidate with proper boundaries
    const qNumbers = qTokens.filter(t => /^\d+$/.test(t));
    for (const qNum of qNumbers) {
        const regex = new RegExp(`(?<!\\d)${qNum}(?!\\d)`);
        const matchedNumber = candTokens.some(ct => regex.test(ct));
        if (!matchedNumber) {
            return 0.05; // Severe penalty
        }
    }

    // Filter out candidates that completely miss critical alphabetical keywords (e.g. "zbook")
    const importantTokens = qTokens.filter(t => /^[a-z]{4,}$/.test(t));
    if (importantTokens.length > 0) {
        let matchedAnyImportant = false;
        for (const impToken of importantTokens) {
            const impForms = getNormalizedForms(impToken);
            const hasMatch = candTokens.some(ct => {
                const ctForms = getNormalizedForms(ct);
                return impForms.some(f => ctForms.some(cf => cf.includes(f) || f.includes(cf) || similarity(f, cf) > 0.8));
            });
            if (hasMatch) {
                matchedAnyImportant = true;
                break;
            }
        }
        if (!matchedAnyImportant) {
            return 0.1; // Filter out completely
        }
    }

    for (const qToken of qTokens) {
        const qForms = getNormalizedForms(qToken);
        const qRaw = qToken.toLowerCase().trim();
        let bestTokenScore = 0;
        
        for (const cToken of candTokens) {
            const cForms = getNormalizedForms(cToken);
            const cRaw = cToken.toLowerCase().trim();
            
            // 1. Check intersection of normalized forms (exact match on normalized or prefix-expanded form)
            const hasCommonForm = qForms.some(f => cForms.includes(f));
            if (hasCommonForm) {
                bestTokenScore = Math.max(bestTokenScore, 1.0);
                continue;
            }
            
            // 2. Substring match on normalized/expanded forms
            let hasSubstringMatch = false;
            for (const qf of qForms) {
                for (const cf of cForms) {
                    if (cf.includes(qf) || qf.includes(cf)) {
                        const ratio = Math.min(qf.length, cf.length) / Math.max(qf.length, cf.length);
                        bestTokenScore = Math.max(bestTokenScore, 0.8 * ratio + 0.1);
                        hasSubstringMatch = true;
                        break;
                    }
                }
                if (hasSubstringMatch) break;
            }
            if (hasSubstringMatch) continue;

            // 3. Exact match on RAW form
            if (qRaw === cRaw) {
                bestTokenScore = Math.max(bestTokenScore, 1.0);
                continue;
            }
            
            // 4. Fuzzy similarity using RAW strings (preserves typos in original script, e.g., "שיואמי" vs "שיאומי")
            const sim = similarity(qRaw, cRaw);
            if (sim > 0.6) {
                bestTokenScore = Math.max(bestTokenScore, sim * 0.95);
            }
        }
        totalScore += bestTokenScore;
    }
    
    // Normalize score by number of query tokens
    let finalScore = totalScore / qTokens.length;

    // Boost score if the candidate contains the exact query words in order
    const qClean = qTokens.join(" ");
    const candClean = candTokens.join(" ");
    if (candClean.includes(qClean)) {
        finalScore += 0.25;
    } else {
        // partial phrase order boost
        let matchedInOrderCount = 0;
        let lastIdx = -1;
        for (const qToken of qTokens) {
            const idx = candTokens.indexOf(qToken);
            if (idx > lastIdx) {
                matchedInOrderCount++;
                lastIdx = idx;
            }
        }
        if (matchedInOrderCount === qTokens.length) {
            finalScore += 0.15;
        }
    }
    
    return Math.min(finalScore, 1.3);
}

// GET /api/marketplace/catalog-search?q=xiomi+redmi+14&cat=Phones&sub=laptop
export async function GET(req: Request) {
    const url = new URL(req.url);
    const q   = url.searchParams.get("q")?.trim() || "";
    const cat = url.searchParams.get("cat") || "";
    const sub = url.searchParams.get("sub") || "";

    if (!q || q.length < 1) return NextResponse.json([]);

    try {
        let candidates: { label: string; details: any; docText: string }[] = [];

        // 1. Fetch catalog data according to category
        if (cat === "Computers") {
            if (!sub || sub === "laptop") {
                const rows = await prismadb.laptopCatalog.findMany();
                rows.forEach(r => {
                    candidates.push({
                        label: getCleanLabel(r.brand, r.series, r.modelName),
                        docText: `${r.brand} ${r.series} ${r.modelName} ${r.sku || ""}`,
                        details: { ...r, dbType: "laptop" }
                    });
                });
            }
            if (!sub || sub === "desktop") {
                const rows = await prismadb.brandDesktopCatalog.findMany();
                rows.forEach(r => {
                    candidates.push({
                        label: getCleanLabel(r.brand, r.series, r.modelName),
                        docText: `${r.brand} ${r.series} ${r.modelName} ${r.sku || ""}`,
                        details: { ...r, dbType: "desktop" }
                    });
                });
            }
            if (!sub || sub === "aio") {
                const rows = await prismadb.aioCatalog.findMany();
                rows.forEach(r => {
                    candidates.push({
                        label: getCleanLabel(r.brand, r.series, r.modelName),
                        docText: `${r.brand} ${r.series} ${r.modelName} ${r.sku || ""}`,
                        details: { ...r, dbType: "aio" }
                    });
                });
            }
        } else if (cat === "Phones") {
            const rows = await prismadb.mobileCatalog.findMany();
            rows.forEach(r => {
                candidates.push({
                    label: r.hebrewAliases?.[0] || getCleanLabel(r.brand, r.series, r.modelName),
                    docText: `${r.brand} ${r.series} ${r.modelName} ${r.hebrewAliases.join(" ")}`,
                    details: { ...r, dbType: "mobile" }
                });
            });
        } else if (cat === "Vehicles") {
            const rows = await prismadb.vehicleCatalog.findMany();
            rows.forEach(r => {
                candidates.push({
                    label: `${r.make} ${r.model}${r.year ? ' ' + r.year : ''}`.trim(),
                    docText: `${r.make} ${r.model} ${r.year || ""} ${r.type || ""} ${r.fuelType || ""} ${r.transmission || ""}`,
                    details: { ...r, dbType: "vehicle" }
                });
            });
        } else if (cat === "Electronics") {
            const rows = await prismadb.electronicsCatalog.findMany();
            rows.forEach(r => {
                candidates.push({
                    label: r.hebrewAliases?.[0] || getCleanLabel(r.brand, "", r.modelName),
                    docText: `${r.brand} ${r.category} ${r.modelName} ${r.hebrewAliases.join(" ")} ${r.specs || ""}`,
                    details: { ...r, dbType: "electronics" }
                });
            });
        } else if (cat === "Appliances") {
            const rows = await prismadb.applianceCatalog.findMany();
            rows.forEach(r => {
                candidates.push({
                    label: r.hebrewAliases?.[0] || getCleanLabel(r.brand, "", r.modelName),
                    docText: `${r.brand} ${r.category} ${r.modelName} ${r.hebrewAliases.join(" ")} ${r.capacity || ""}`,
                    details: { ...r, dbType: "appliance" }
                });
            });
        }

        // 2. Score candidates in memory using our advanced fuzzy scoring
        const qTokens = getTokens(q);
        const mentionedGroups = getMentionedBrandGroups(qTokens);
        const scored = candidates.map(c => ({
            label: c.label,
            details: c.details,
            score: scoreCandidate(q, c.docText, mentionedGroups)
        }));

        // 3. Filter minimum relevance, sort and slice top 15
        const results = scored
            .filter(r => r.score > 0.28)
            .sort((a, b) => b.score - a.score)
            .map(r => ({ label: r.label, details: r.details }));

        // Remove duplicate labels to clean up the UI dropdown
        const uniqueResults: { label: string; details: any }[] = [];
        const seenLabels = new Set<string>();
        for (const item of results) {
            if (!seenLabels.has(item.label.toLowerCase())) {
                seenLabels.add(item.label.toLowerCase());
                uniqueResults.push(item);
            }
        }

        return NextResponse.json(uniqueResults.slice(0, 15));
    } catch (e: any) {
        console.error("[catalog-search]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
