import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { dbCache } from "@/lib/db-cache";

// Helper: Generate n-grams (up to 4 words) from text to execute highly targeted DB queries
function generateNGrams(text: string, maxLen = 4): string[] {
    const tokens = text.split(/\s+/).filter(Boolean);
    const ngrams = new Set<string>();
    for (let i = 0; i < tokens.length; i++) {
        for (let len = 1; len <= maxLen; len++) {
            if (i + len <= tokens.length) {
                ngrams.add(tokens.slice(i, i + len).join(" "));
            }
        }
    }
    return Array.from(ngrams);
}

export async function POST(req: Request) {
    try {
        const { text, category } = await req.json();
        if (!text) return NextResponse.json({ success: true, words: [] });

        const searchCat = category && category !== "UNKNOWN" ? category.toUpperCase() : "LAPTOPS";

        // Clean and tokenize — preserve commas/dots if they are between digits (e.g. "5,300" or "1.5")
        const cleanText = text.replace(/(?!\d)[,.]|[,.](?!\d)|[\n:-]/g, ' ').toLowerCase();
        
        // ⚡ SCALING OPTIMIZATION: Instead of loading the entire DB memory,
        // we generate N-Grams and ask the DB *only* for the words that appear in the text!
        const nGrams = generateNGrams(cleanText, 4);

        // Fetch Targeted data into memory ONCE (takes ~10ms via native IN query)
        const [allDict, allSignals, allAnchors] = await Promise.all([
            (prismadb as any).fieldValueReliability.findMany({ 
                where: { category: searchCat, value: { in: nGrams } } 
            }),
            (prismadb as any).fieldSignal.findMany({ 
                where: { category: searchCat, rawValue: { in: nGrams } } 
            }),
            (prismadb as any).fieldAnchor.findMany({ 
                where: { category: searchCat, phrase: { in: nGrams } } 
            })
        ]);

        // Transform arrays into O(1) Hash Maps mapping phrase -> entries
        const dictMap = new Map<string, any[]>();
        (allDict as any[]).forEach(d => {
            if (!dictMap.has(d.value)) dictMap.set(d.value, []);
            dictMap.get(d.value)!.push(d);
        });

        const sigMap = new Map<string, any[]>();
        (allSignals as any[]).forEach(s => {
            if (!sigMap.has(s.rawValue)) sigMap.set(s.rawValue, []);
            sigMap.get(s.rawValue)!.push(s);
        });

        const ancMap = new Map<string, any[]>();
        (allAnchors as any[]).forEach(a => {
            if (!ancMap.has(a.phrase)) ancMap.set(a.phrase, []);
            ancMap.get(a.phrase)!.push(a);
        });

        const getWithPrefixStripped = (word: string, map: Map<string, any[]>) => {
            if (map.has(word)) return map.get(word)!;
            // Handle Hebrew prefixes up to 2 letters (ב, ה, ו, כ, ל, מ, ש)
            for (let i = 1; i <= 2; i++) {
                if (word.length > i) {
                    const prefix = word.slice(0, i);
                    if (/^[וכהבלמש]{1,2}-?$/.test(prefix)) {
                        const remainder = word.slice(i);
                        if (map.has(remainder)) return map.get(remainder)!;
                    }
                }
            }
            return [];
        };

        const rawTokens = cleanText.split(/\s+/).filter(Boolean);

        const wordData: any[] = [];
        let i = 0;
        
        while (i < rawTokens.length) {
            let matchedPhrase = null;
            let matchedLength = 1;
            let dictEntries: any[] = [];
            let signalEntries: any[] = [];
            let anchorEntries: any[] = [];

            // נסה קודם למצוא ביטויים ארוכים (3 מילים, אז 2 מילים, אז מילה 1)
            for (let len = 3; len >= 1; len--) {
                if (i + len > rawTokens.length) continue;
                
                const phrase = rawTokens.slice(i, i + len).join(" ");
                
                // בדיקת הנר (Candle) במילון - מחושב בזיכרון ב-O(1) Hash Map
                dictEntries = dictMap.get(phrase) || [];

                if (dictEntries.length > 0) {
                    matchedPhrase = phrase;
                    matchedLength = len;
                    break; // מצאנו נר! נפסיק לחפש פנימה
                }
            }

            const currentWord = rawTokens[i];
            const checkPhrase = matchedPhrase || currentWord;

            // אם לא מצאנו נר, נחפש סיגנלים או עוגנים רק על המילה הבודדת הזו מתוך הזיכרון (כולל תמיכה בקידומות עבריות!)
            if (!matchedPhrase) {
                dictEntries = getWithPrefixStripped(checkPhrase, dictMap);
                signalEntries = getWithPrefixStripped(checkPhrase, sigMap);
                anchorEntries = getWithPrefixStripped(checkPhrase, ancMap);
            }

            const hasCandle = dictEntries.length > 0;
            const hasSignal = signalEntries.length > 0;
            const hasAnchor = anchorEntries.length > 0;

            let colorClass = "";
            if (hasCandle) {
                colorClass = "bg-purple-900/40 text-purple-200 border-b-2 border-purple-400 cursor-help font-bold";
            } else if (hasSignal) {
                colorClass = "bg-emerald-900/30 text-emerald-300 border-b-2 border-emerald-500 cursor-help font-bold";
            } else if (hasAnchor) {
                colorClass = "bg-amber-900/30 text-amber-300 border-b-2 border-amber-500 cursor-help font-bold";
            } else {
                colorClass = "bg-indigo-600/30 text-indigo-200 border-b-2 border-indigo-500/50 cursor-help font-medium";
            }

            wordData.push({
                word: checkPhrase,
                inDictionary: hasCandle || hasSignal || hasAnchor,
                colorClass,
                weights: {
                    dictionary: dictEntries.map((d: any) => ({ field: d.field, conf: d.confidence, ignored: d.isIgnored, value: d.value })),
                    signal:     signalEntries.map((s: any) => ({ field: s.field, weight: s.weight, ignored: s.isIgnored })),
                    anchor:     anchorEntries.reduce((acc: any[], a: any) => {
                                    const fc = a.fieldConfidences || {};
                                    (a.relatedFields || []).forEach((relField: string) => {
                                        acc.push({
                                            field: relField,
                                            conf: fc[relField] ?? a.confidence ?? 0.5,
                                            ignored: a.isIgnored
                                        });
                                    });
                                    return acc;
                                }, [])
                }
            });

            // אם מצאנו ביטוי (למשל 3 מילים), קפוץ 3 מילים קדימה כדי לא להציג אותן שוב בנפרד!
            i += matchedLength;
        }

        return NextResponse.json({ success: true, words: wordData });
    } catch (e) {
        console.error("Debug word weights error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
