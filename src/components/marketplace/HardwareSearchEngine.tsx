"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchLaptops, searchBrandDesktops, searchAio, searchMobile, getAutocomplete, searchVehicles, searchElectronics, searchAppliances } from "@/app/actions/hardware-search";

interface HardwareSearchEngineProps {
    category: string;
    onSelect: (data: any) => void;
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
    } else if (category === "Vehicles") {
        return {
            autocomplete: `You are a vehicle model autocomplete engine. Given a partial make/model, return ONLY a JSON array of up to 5 matching real vehicle suggestions. Format: "Make Model". Return ONLY the JSON array.`,
            search: `You are an automotive expert. Identify the exact vehicle from the query.
Return ONLY a valid JSON object using EXACTLY these keys matching Hebrew labels:
{
  "יצרן": "make",
  "דגם": "model",
  "שנת ייצור": "year",
  "סוג רכב": "Sedan/SUV/etc",
  "סוג מנוע": "Gasoline/Electric/Hybrid",
  "תיבת הילוכים": "Automatic/Manual",
  "נפח מנוע": "Engine size in cc",
  "כוחות סוס": "HP"
}
Return ONLY JSON.`
        };
    } else if (category === "Electronics") {
        return {
            autocomplete: `You are an electronics model autocomplete engine. Return ONLY a JSON array of up to 5 matching suggestions.`,
            search: `You are an electronics expert. Identify the exact product.
Return ONLY a valid JSON object using EXACTLY these keys matching Hebrew labels:
{
  "יצרן": "brand",
  "דגם": "model",
  "קטגוריה": "Smartwatch/TV/Headphones/etc",
  "שנת השקה": "release year",
  "מפרט": "detailed specs as string"
}
Return ONLY JSON.`
        };
    } else if (category === "Appliances") {
        return {
            autocomplete: `You are a home appliance autocomplete engine. Return ONLY a JSON array of up to 5 matching suggestions.`,
            search: `You are an appliance expert. Identify the exact product.
Return ONLY a valid JSON object using EXACTLY these keys matching Hebrew labels:
{
  "יצרן": "brand",
  "דגם": "model",
  "קטגוריה": "Refrigerator/Washer/etc",
  "קיבולת": "capacity (L/KG/BTU)",
  "דירוג אנרגטי": "energy rating"
}
Return ONLY JSON.`
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

        try {
            // Get DB suggestions
            const dbResults = await getAutocomplete(text, category);
            if (token !== abortTokenRef.current) return;

            if (dbResults.length > 0) {
                setSuggestions(dbResults);
                setShowSuggestions(true);
            }

            // Still allow AI logic to kick in if DB results are few
            if (dbResults.length < 5) {
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
                const textContent = data.content?.[0]?.text || "[]";
                const aiRaw: string[] = JSON.parse(textContent);

                if (Array.isArray(aiRaw)) {
                    const dbLabels = dbResults.map((r: any) => typeof r === 'string' ? r : r.label);
                    const combined = Array.from(new Set([...dbLabels, ...aiRaw])).slice(0, 10);
                    setSuggestions(combined);
                    setShowSuggestions(combined.length > 0);
                } else {
                    const dbLabels = dbResults.map((r: any) => typeof r === 'string' ? r : r.label);
                    setSuggestions(dbLabels);
                }
            }
        } catch (e) {
            console.error("Suggestions error:", e);
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
            // 1. Try Database Search first
            if (category === "Computers") {
                const laptops = await searchLaptops(q);
                const desktops = await searchBrandDesktops(q);
                const aios = await searchAio(q);
                const allResults = [...laptops, ...desktops, ...aios];
                
                if (allResults.length > 0) {
                    const best = allResults[0];
                    onSelect({
                        "יצרן": best.brand,
                        "דגם": best.model,
                        "מספר דגם": best.sku,
                        "סוג מחשב": best.type || "",
                        "RAM": best.ram,
                        "נפח אחסון": best.storage,
                        "גודל מסך": best.screen,
                        "מעבד": best.cpu,
                        "כרטיס מסך": best.gpu,
                        "מערכת הפעלה": best.os,
                        "שנת השקה": best.year
                    });
                    setLoading(false);
                    return;
                }
            } else if (category === "Phones") {
                const results = await searchMobile(q);
                if (results.length > 0) {
                    const best = results[0];
                    onSelect({
                        "יצרן": best.brand,
                        "דגם": best.model,
                        "שנת השקה": best.year,
                        "נפח אחסון": best.storage,
                        "מסך": best.screen,
                        "מעבד": best.cpu,
                        "RAM": best.ram,
                        "מפרט סוללה": best.battery,
                        "מצלמות": best.cameras
                    });
                    setLoading(false);
                    return;
                }
            } else if (category === "Vehicles") {
                const results = await searchVehicles(q);
                if (results.length > 0) {
                    const best = results[0];
                    onSelect({
                        "יצרן": best.make,
                        "דגם": best.model,
                        "שנת ייצור": best.year,
                        "סוג רכב": best.type,
                        "סוג מנוע": best.fuel,
                        "תיבת הילוכים": best.transmission,
                        "נפח מנוע": best.engineSize,
                        "כוחות סוס": best.hp
                    });
                    setLoading(false);
                    return;
                }
            } else if (category === "Electronics") {
                const results = await searchElectronics(q);
                if (results.length > 0) {
                    const best = results[0];
                    onSelect({
                        "יצרן": best.brand,
                        "דגם": best.model,
                        "קטגוריה": best.category,
                        "שנת השקה": best.year,
                        "מפרט": JSON.stringify(best.specs)
                    });
                    setLoading(false);
                    return;
                }
            } else if (category === "Appliances") {
                const results = await searchAppliances(q);
                if (results.length > 0) {
                    const best = results[0];
                    onSelect({
                        "יצרן": best.brand,
                        "דגם": best.model,
                        "קטגוריה": best.category,
                        "קיבולת": best.capacity,
                        "דירוג אנרגטי": best.energyRating
                    });
                    setLoading(false);
                    return;
                }
            }

            // 2. Try AI Search (Original flow)
            const response = await fetch("/api/hardware-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt: prompts.search,
                    query: q
                }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const textContent = data.content?.[0]?.text || "{}";
            const parsed = JSON.parse(textContent);
            onSelect(parsed);
        } catch (e: any) {
            console.error("Search error:", e);
            setError("לא נמצא במאגר וחיפוש AI נכשל. אנא הזן ידנית.");
        } finally {
            setLoading(false);
        }
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
