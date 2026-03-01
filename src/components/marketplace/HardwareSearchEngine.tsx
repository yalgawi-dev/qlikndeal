"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL_PHONES } from "@/lib/phone-data";
import { COMPUTER_DATABASE } from "@/lib/computer-data";

interface HardwareSearchEngineProps {
    category: string;
    onSelect: (data: Record<string, string>) => void;
}

const getPrompts = (category: string) => {
    if (category === "Phones") {
        return {
            autocomplete: `You are a mobile phone model autocomplete engine. Given a partial phone/tablet model name or SKU, return ONLY a JSON array of up to 5 matching real device model suggestions. Format: "Model Number (Product Name)" or just "Product Name". Return ONLY the JSON array. No markdown.`,
            search: `You are a mobile device hardware expert. Identify the exact device from the user query.
Return ONLY a valid JSON object using EXACTLY these keys matching Hebrew labels (use empty string "" if unknown):
{
  "יצרן": "brand (Apple, Samsung, etc)",
  "דגם": "official product name without brand mostly",
  "מספר דגם": "SKU or official model number",
  "סוג מכשיר": "smartphone / tablet / smartwatch etc",
  "מעבד": "chipset / SoC",
  "RAM": "RAM amount",
  "נפח אחסון": "Storage in GB/TB",
  "מסך": "size, refresh rate, panel type",
  "מצלמה אחורית": "megapixels and features",
  "מצלמה קדמית": "megapixels",
  "סוללה": "battery capacity in mAh",
  "טעינה": "charging speeds (W)",
  "מערכת הפעלה": "OS at launch",
  "קישוריות": "5G, WiFi type, Bluetooth version",
  "כרטיס SIM": "SIM type / eSIM",
  "חיבורים": "ports (e.g. USB-C 3.2)",
  "ביומטריקה": "fingerprint, face ID etc",
  "חומרים ועמידות": "glass type, frame material, IP rating",
  "מימדים ומשקל": "dimensions and weight in grams",
  "צבעים": "available colors",
  "מחיר משוער": "approx launch price or current value",
  "שנת השקה": "release year"
}
Return ONLY JSON, no markdown formatting blocks.`
        };
    } else {
        return {
            autocomplete: `You are a computer model autocomplete engine. Given a partial laptop/desktop/server model name or SKU, return ONLY a JSON array of up to 5 matching real computer suggestions. Format: "Model Number (Product Name)" or just "Product Name". Return ONLY the JSON array. No markdown.`,
            search: `You are a computer hardware expert. Identify the exact computer or generic model from the query.
Return ONLY a valid JSON object using EXACTLY these keys matching Hebrew labels (use empty string "" if unknown):
{
  "יצרן": "brand (Lenovo, Dell, Apple, etc)",
  "דגם": "product name",
  "מספר דגם": "SKU or specific model number",
  "סוג מחשב": "laptop / desktop / workstation / mini-pc etc",
  "מעבד": "CPU details",
  "כרטיס מסך": "GPU details",
  "RAM": "RAM amount and type",
  "נפח אחסון": "storage variants in GB/TB",
  "גודל מסך": "size in inches, resolution, panel",
  "סוללה": "battery Wh (if applicable)",
  "מערכת הפעלה": "OS",
  "חיבורים": "ports and connectivity",
  "משקל ומימדים": "weight in kg and dimensions",
  "לוח אם": "motherboard details (desktops mainly)",
  "ספק כוח": "PSU (desktops mainly)",
  "מארז וקירור": "case and cooling (desktops mainly)",
  "מחיר משוער": "approx launch price",
  "שנת השקה": "release year"
}
Return ONLY JSON, no markdown formatting blocks.`
        };
    }
}

export function HardwareSearchEngine({ category, onSelect }: HardwareSearchEngineProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState("");

    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const abortTokenRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const prompts = getPrompts(category);

    const fetchSuggestions = useCallback(async (text: string, token: number) => {
        if (text.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSuggestionsLoading(false);
            return;
        }
        setSuggestionsLoading(true);

        // --- Local Data Matching Logic ---
        const getScoredMatches = (queryStr: string) => {
            const q = queryStr.toLowerCase().trim();
            const scored: { text: string; score: number }[] = [];

            if (category === "Phones") {
                ALL_PHONES.forEach(p => {
                    const brandLower = p.brand.toLowerCase();
                    const modelLower = p.model.toLowerCase();
                    const fullName = modelLower.includes(brandLower) ? p.model.toLowerCase() : `${brandLower} ${p.model.toLowerCase()}`;
                    const displayLabel = modelLower.startsWith(brandLower) ? p.model : `${p.brand} ${p.model}`;
                    
                    let score = 0;
                    // TIER 1: Prefix match on the full visible label
                    if (displayLabel.toLowerCase().startsWith(q)) {
                        score = 1000;
                    }
                    // TIER 2: Any word starts with query
                    else if (fullName.split(/\s+/).some(word => word.startsWith(q))) {
                        score = 500;
                    }
                    // TIER 3: Contains
                    else if (fullName.includes(q)) {
                        score = 100;
                    }

                    if (score > 0) {
                        scored.push({ text: displayLabel, score });
                    }
                });
            } else if (category === "Computers") {
                for (const brand in COMPUTER_DATABASE) {
                    const brandLower = brand.toLowerCase();
                    for (const family of COMPUTER_DATABASE[brand]) {
                        for (const sub of family.subModels) {
                            const modelLower = sub.name.toLowerCase();
                            const fullName = modelLower.includes(brandLower) ? sub.name.toLowerCase() : `${brandLower} ${modelLower}`;
                            const displayLabel = modelLower.startsWith(brandLower) ? sub.name : `${brand} ${sub.name}`;
                            
                            let score = 0;
                            if (displayLabel.toLowerCase().startsWith(q)) {
                                score = 1000;
                            }
                            else if (fullName.split(/\s+/).some(word => word.toLowerCase().startsWith(q))) {
                                score = 500;
                            }
                            else if (fullName.includes(q)) {
                                score = 100;
                            }

                            if (score > 0) {
                                scored.push({ text: displayLabel, score });
                            }
                        }
                    }
                }
            }

            // Internal Sort: Score (Tier) then ABC (Asc)
            scored.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.text.localeCompare(b.text, 'en', { sensitivity: 'base' });
            });

            return scored;
        };

        const localMatches = getScoredMatches(text);
        const localTexts = localMatches.map(m => m.text);
        
        // Initial show with local data to be fast
        if (localTexts.length > 0) {
            setSuggestions(localTexts.slice(0, 20));
            setShowSuggestions(true);
        }

        try {
            const response = await fetch("/api/hardware-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt: prompts.autocomplete,
                    query: text
                }),
            });
            if (token !== abortTokenRef.current) return;
            const data = await response.json();

            if (data.error) throw new Error(data.error);
            const textContent = data.content?.[0]?.text || "[]";
            const aiRaw: string[] = JSON.parse(textContent);

            if (token !== abortTokenRef.current) return;
            
            // Merge AI suggestions with local ones, avoiding duplicates
            const combinedSet = new Set(localTexts);
            const finalResults = [...localTexts];
            
            if (Array.isArray(aiRaw)) {
                for (const aiS of aiRaw) {
                    if (!combinedSet.has(aiS)) {
                        combinedSet.add(aiS);
                        finalResults.push(aiS);
                    }
                }
            }

            // Final truncation to 20
            setSuggestions(finalResults.slice(0, 20));
            setShowSuggestions(finalResults.length > 0);
        } catch (e) {
            if (token === abortTokenRef.current) {
                setSuggestions(localTexts.slice(0, 20));
                setShowSuggestions(localTexts.length > 0);
            }
        } finally {
            if (token === abortTokenRef.current) setSuggestionsLoading(false);
        }
    }, [prompts.autocomplete, category]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const trimmed = query.trim();
        if (trimmed.length >= 1) {
            debounceRef.current = setTimeout(() => {
                abortTokenRef.current += 1;
                fetchSuggestions(trimmed, abortTokenRef.current);
            }, 150);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setSuggestionsLoading(false);
        }
        return () => clearTimeout(debounceRef.current as any);
    }, [query, fetchSuggestions]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const doSearch = async (searchQuery: string) => {
        const q = searchQuery.trim();
        if (!q) return;

        setLoading(true);
        setError("");
        setShowSuggestions(false);
        setQuery(q);

        try {
            const response = await fetch("/api/hardware-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt: prompts.search,
                    query: q
                }),
            });
            const data = await response.json();
            if (data.error) {
                // Fallback attempt for exact match local data if API fails completely due to no API Key
                if (data.error.includes("API Key is missing")) {
                    handleLocalFallbackFill(q);
                } else {
                    throw new Error(data.error);
                }
                return;
            }

            const textContent = data.content?.[0]?.text || "{}";
            const parsed = JSON.parse(textContent);
            onSelect(parsed);
        } catch (e: any) {
            handleLocalFallbackFill(q);
        } finally {
            setLoading(false);
        }
    };

    const handleLocalFallbackFill = (q: string) => {
        const queryStr = q.toLowerCase().trim();
        const terms = queryStr.split(/\s+/);

        const matchesAllTerms = (text: string) => {
            if (!text) return false;
            const textLower = text.toLowerCase();
            return terms.every(term => textLower.includes(term));
        };

        if (category === "Phones") {
            // Find best matching phone
            let bestPhone = null;
            let bestScore = 0;

            for (const p of ALL_PHONES) {
                let score = 0;
                if (matchesAllTerms(p.model)) score += 10;
                if (p.hebrewAliases?.some(a => matchesAllTerms(a))) score += 8;
                if (matchesAllTerms(`${p.brand} ${p.model}`)) score += 5;

                if (score > bestScore) {
                    bestScore = score;
                    bestPhone = p;
                }
            }

            if (bestPhone) {
                onSelect({
                    "יצרן": bestPhone.brand,
                    "דגם": bestPhone.model,
                    "שנת השקה": bestPhone.releaseYear?.toString() || "",
                    "נפח אחסון": bestPhone.storages.map(s => s + "GB").join(" / "),
                    "מסך": bestPhone.screen ? bestPhone.screen + " אינץ'" : ""
                });
                return;
            }
        } else {
            let bestMatchData: any = null;
            let bestScore = 0;

            for (const brand in COMPUTER_DATABASE) {
                for (const family of COMPUTER_DATABASE[brand]) {
                    for (const sub of family.subModels) {
                        const fullName = `${brand} ${sub.name}`;

                        let matchScore = 0;
                        if (matchesAllTerms(sub.name)) {
                            matchScore += 10;
                            if (sub.name.toLowerCase() === queryStr || fullName.toLowerCase() === queryStr) matchScore += 20;
                            else if (sub.name.toLowerCase().startsWith(queryStr) || fullName.toLowerCase().startsWith(queryStr)) matchScore += 5;
                        }
                        else if (matchesAllTerms(fullName)) matchScore += 8;

                        // Check SKUs for precise match
                        let matchedSku = null;
                        if (sub.skus) {
                            for (const sku of sub.skus) {
                                if (sku.id && matchesAllTerms(sku.id)) {
                                    matchScore += 15; // SKU match is best
                                    matchedSku = sku;
                                }
                            }
                        }

                        if (matchScore > bestScore) {
                            bestScore = matchScore;
                            bestMatchData = {
                                brand,
                                familyType: family.type,
                                sub,
                                matchedSku
                            };
                        }
                    }
                }
            }

            if (bestMatchData) {
                const { brand, familyType, sub, matchedSku } = bestMatchData;
                onSelect({
                    "יצרן": brand,
                    "דגם": sub.name,
                    "מספר דגם": matchedSku?.id || "",
                    "סוג מחשב": familyType,
                    "RAM": matchedSku?.ram?.join(" / ") || sub.ram?.join(" / ") || "",
                    "נפח אחסון": matchedSku?.storage?.join(" / ") || sub.storage?.join(" / ") || "",
                    "גודל מסך": matchedSku?.screenSize?.join(" / ") || sub.screenSize?.join(" / ") || "",
                    "מעבד": matchedSku?.cpu?.length ? matchedSku.cpu[0] : (sub.cpu?.length ? sub.cpu[0] : ""),
                    "כרטיס מסך": matchedSku?.gpu?.length ? matchedSku.gpu[0] : (sub.gpu?.length ? sub.gpu[0] : ""),
                    "מערכת הפעלה": matchedSku?.os?.length ? matchedSku.os[0] : (sub.os?.length ? sub.os[0] : "")
                });
                return;
            }
        }
        setError("לא נמצא במאגר המקומי ו-API קרס/חסר. פתח ידנית.");
    };

    return (
        <div className="bg-gradient-to-tr from-cyan-900/20 to-blue-900/20 border border-cyan-800/40 p-4 rounded-xl flex flex-col gap-3" ref={containerRef}>
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Search className="w-5 h-5" />
                <span>מילוי מפרט חכם מבוסס AI</span>
            </div>
            <p className="text-xs text-gray-300">
                {category === "Phones"
                    ? "הכנס שם דגם או מזהה (SKU) של הסלולר, והמערכת תשלוף את כל המפרט אוטומטית."
                    : "הכנס שם דגם או SKU של המחשב לחיפוש פרמטרים אוטומטי."}
            </p>

            <div className="flex gap-2 relative">
                <div className="w-full relative">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="לדוגמה: iPhone 14 Pro Max / XPS 15 9530"
                        className="bg-gray-900 border-cyan-800/50 pr-10 pl-4 w-full"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                doSearch(query);
                            }
                        }}
                    />
                    {suggestionsLoading && (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3 top-3" />
                    )}
                </div>

                <Button
                    type="button"
                    onClick={() => doSearch(query)}
                    disabled={loading || !query.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[100px]"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "חפש ומלא"}
                </Button>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full right-0 left-[108px] mt-1 bg-gray-900 border border-cyan-800/50 rounded-lg shadow-xl z-[999] overflow-hidden">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); doSearch(s); }}
                                className="w-full text-right px-4 py-2 hover:bg-cyan-900/40 text-sm text-gray-200 border-b border-gray-800 last:border-0 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="text-sm text-red-400 bg-red-900/10 p-2 rounded-lg mt-1">
                    {error}
                </div>
            )}
        </div>
    );
}
