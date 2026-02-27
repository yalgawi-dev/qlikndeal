import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Zap, Sparkles, X, ChevronRight, Smartphone } from "lucide-react";
import { ALL_PHONES, PhoneModel } from "@/lib/phone-data";

export const MOBILE_SEARCH_FIELDS = [
    { key: "model_name", label: "שם הדגם", icon: "🏷️", locked: true },
    { key: "model_number", label: "מספר דגם / SKU", icon: "#️⃣", locked: true },
    { key: "type", label: "סוג מכשיר", icon: "📱", locked: true },
    { key: "cpu", label: "מעבד (SoC)", icon: "⚡", locked: true },
    { key: "ram", label: "זיכרון RAM", icon: "🧠", locked: false, options: ["ללא ידוע", "4GB", "6GB", "8GB", "12GB", "16GB"] },
    { key: "storage", label: "אחסון פנימי", icon: "💾", locked: false, options: ["ללא ידוע", "64GB", "128GB", "256GB", "512GB", "1TB"] },
    { key: "display", label: "מסך", icon: "🖥️", locked: true },
    { key: "rear_camera", label: "מצלמה אחורית", icon: "📷", locked: true },
    { key: "front_camera", label: "מצלמה קדמית", icon: "🤳", locked: true },
    { key: "battery", label: "סוללה", icon: "🔋", locked: true },
    { key: "os", label: "מערכת הפעלה", icon: "🪟", locked: false },
    { key: "ports", label: "חיבורים", icon: "🔌", locked: true },
    { key: "weight", label: "משקל / מימדים", icon: "📐", locked: true },
    { key: "price", label: "מחיר משוער", icon: "💰", locked: true },
    { key: "release_year", label: "שנת השקה", icon: "📅", locked: true },
    { key: "notes", label: "הערות נוספות", icon: "📝", locked: true },
];

function searchPhoneDB(q: string, limit = 15): { label: string; data: PhoneModel }[] {
    if (!q || q.length < 2) return [];
    const lowerQ = q.toLowerCase().trim();
    const terms = lowerQ.split(/\s+/);
    
    const results: { label: string; score: number; data: PhoneModel }[] = [];
    
    for (const p of ALL_PHONES) {
        let score = 0;
        const brand = p.brand.toLowerCase();
        const model = p.model.toLowerCase();
        const fullName = `${brand} ${model}`;
        
        // Exact match on full name or model
        if (fullName === lowerQ || model === lowerQ) {
            score += 100;
        } 
        // Starts with
        else if (fullName.startsWith(lowerQ) || model.startsWith(lowerQ)) {
            score += 60;
        }
        // Contains brand AND model terms
        else if (terms.every(t => fullName.includes(t))) {
            score += 40;
            // Higher score if the brand is specifically mentioned
            if (terms.includes(brand)) score += 10;
        }
        
        // Hebrew alias match
        if (p.hebrewAliases) {
            for (const alias of p.hebrewAliases) {
                const lowerA = alias.toLowerCase();
                if (lowerA === lowerQ) score = Math.max(score, 95);
                else if (lowerA.startsWith(lowerQ)) score = Math.max(score, 50);
                else if (terms.every(t => lowerA.includes(t))) score = Math.max(score, 30);
            }
        }
        
        if (score > 0) {
            results.push({ label: `${p.brand} ${p.model}`, score, data: p });
        }
    }
    
    return results
        .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
        .slice(0, limit)
        .map(r => ({ label: r.label, data: r.data }));
}

export function MobileSearchUI({ onApplySpecs }: { onApplySpecs: (specs: any) => void }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ label: string; data: PhoneModel }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [editableFields, setEditableFields] = useState<Record<string, string>>({});
    
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<any>(null);

    // Handle Autocomplete
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2 || isPremium) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            const results = searchPhoneDB(query);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        }, 200);
    }, [query, isPremium]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectPhone = (phone: PhoneModel) => {
        setQuery(`${phone.brand} ${phone.model}`);
        setShowSuggestions(false);
        applyLocalPhone(phone);
    };

    const applyLocalPhone = (phone: PhoneModel) => {
        const localResult = {
            model_name: phone.model,
            brand: phone.brand,
            model_number: "",
            type: "smartphone",
            ram: phone.ram ? phone.ram + "GB" : "לא ידוע",
            storage: phone.storages?.map((s: number) => s + "GB").join(" / ") || "לא ידוע",
            display: phone.screen ? phone.screen + '"' : "",
            os: phone.os || "",
            release_year: phone.releaseYear?.toString() || "",
            cpu: phone.cpu || "",
            battery: phone.battery || "",
            rear_camera: phone.rear_camera || "",
            front_camera: phone.front_camera || "",
            dimensions: phone.dimensions || "",
            weight: phone.weight || "",
            usb_type: phone.usb_type || "",
            nfc: phone.nfc !== undefined ? (phone.nfc ? "כן" : "לא") : "",
            wireless_charging: phone.wireless_charging !== undefined ? (phone.wireless_charging ? "כן" : "לא") : "",
            notes: ""
        };
        setResult(localResult);
        setEditableFields({
            ram: localResult.ram,
            storage: localResult.storage,
            os: localResult.os
        });
    };

    const doSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setEditableFields({});
        setShowSuggestions(false);

        try {
            if (isPremium) {
                // Call Premium API
                const response = await fetch("/api/marketplace/premium-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query, category: "mobile" })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setResult(data);

                setEditableFields({
                    ram: data.ram || "ללא ידוע",
                    storage: data.storage || "ללא ידוע",
                    os: data.os || "ללא מערכת הפעלה"
                });
            } else {
                // Try local first
                const localMatches = searchPhoneDB(query, 1);
                if (localMatches.length > 0) {
                    applyLocalPhone(localMatches[0].data);
                } else {
                    throw new Error(`"${query}" לא נמצא במאגר המקומי. נסה להפעיל חיפוש פרימיום ברשת (לחצן כחול) לחיפוש מפורט.`);
                }
            }
        } catch (e: any) {
            setError(e.message || "לא הצלחתי למצוא מידע.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!result) return;
        const finalSpec = { ...result, ...editableFields };
        onApplySpecs(finalSpec);
    };

    const getTypeIcon = (type: string) => {
        if (!type) return "📱";
        const t = type.toLowerCase();
        if (t.includes("tablet") || t.includes("ipad")) return "📲";
        if (t.includes("watch")) return "⌚";
        return "📱";
    };

    return (
        <div ref={containerRef} style={{
            background: "linear-gradient(160deg, #080b14 0%, #0a0f1e 60%, #080b14 100%)",
            color: "#e2e8f0",
            direction: "rtl",
            borderRadius: "16px",
            border: "1px solid #1a2744",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(90deg, #0d1117 0%, #111827 100%)",
                borderBottom: "1px solid #1a2744",
                padding: "20px 24px",
                display: "flex", alignItems: "center", gap: "16px",
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                    boxShadow: "0 0 20px rgba(56,189,248,0.3)",
                }}>📱</div>
                <div className="flex-1">
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>
                        מנוע חיפוש מפרט סלולר
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#4b6080" }}>
                        שולף את כל נתוני המכשיר - יכולות עריכה לדברים הלקוח יכול לבחור (כמו זכרון ונפח).
                    </p>
                </div>

                {/* Premium Toggle */}
                <button
                    onClick={() => setIsPremium(!isPremium)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${isPremium
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                            : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300'}`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    פרימיום AI ברשת
                </button>
            </div>

            <div style={{ padding: "24px" }}>
                {/* Search Input Bar */}
                <div style={{ position: "relative", marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <div className="relative flex-1">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                placeholder='הזן SKU, דגם או מפרט חלקי... (לדוגמה iPhone 15 Pro)'
                                style={{
                                    width: "100%", padding: "12px 16px", borderRadius: "12px",
                                    border: "1px solid #1a2744", background: "#070b14",
                                    color: "#e2e8f0", fontSize: "0.95rem", outline: "none",
                                }}
                            />
                            {/* Autocomplete Dropdown */}
                            {showSuggestions && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1117] border border-[#1a2744] rounded-xl shadow-2xl z-[100] overflow-hidden max-h-[300px] overflow-y-auto backdrop-blur-md">
                                    {suggestions.map((sug, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectPhone(sug.data)}
                                            className="w-full text-right px-4 py-3 text-sm text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors flex items-center gap-3 border-b border-gray-800/50 last:border-0"
                                        >
                                            <Smartphone className="w-4 h-4 text-gray-500" />
                                            <span>{sug.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={doSearch}
                            disabled={loading || !query.trim()}
                            style={{
                                padding: "0 24px", borderRadius: "12px", border: "none",
                                background: loading ? "#1a2744" : "linear-gradient(135deg, #38bdf8, #818cf8)",
                                color: "white", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer"
                            }}
                        >
                            {loading ? "מחפש..." : "חפש"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: "16px", borderRadius: "12px", background: "#180a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Results UI */}
                {result && !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div style={{
                            padding: "16px 20px", borderRadius: "12px 12px 0 0",
                            background: "linear-gradient(135deg, #0a0f1c, #0f1829)",
                            border: "1px solid #1a2744", borderBottom: "none",
                            display: "flex", alignItems: "center", gap: "12px",
                        }}>
                            <span style={{ fontSize: "1.8rem" }}>{getTypeIcon(result.type)}</span>
                            <div className="flex-1">
                                <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#f1f5f9" }}>{result.model_name || query}</h2>
                                <span style={{ fontSize: "0.78rem", background: "#818cf820", color: "#a5b4fc", padding: "2px 10px", borderRadius: "20px", border: "1px solid #818cf840" }}>
                                    #{result.model_number || "SKU לא ידוע"}
                                </span>
                            </div>
                        </div>

                        {/* Editable Tables Grid */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                            gap: "1px", background: "#1a2744", border: "1px solid #1a2744", borderTop: "none",
                            borderRadius: "0 0 12px 12px", overflow: "hidden",
                        }}>
                            {MOBILE_SEARCH_FIELDS.filter(f => !["type", "model_name", "model_number"].includes(f.key)).map((field) => (
                                <div key={field.key} style={{ padding: "12px 16px", background: "#070b14", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "0.95rem" }}>{field.icon}</span>
                                        <span style={{ fontSize: "0.75rem", color: "#4b6080", fontWeight: 600 }}>{field.label}</span>
                                        {!field.locked && <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20 mr-auto">ניתן לעריכה</span>}
                                    </div>

                                    {/* Display locked text or editable dropdown/input */}
                                    {field.locked ? (
                                        <div style={{ fontSize: "0.85rem", color: result[field.key] ? "#e2e8f0" : "#334155" }}>
                                            {field.key === "price" && result[field.key] ? <span className="text-blue-400">{result[field.key]}</span> : (result[field.key] || "—")}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                value={editableFields[field.key] ?? result[field.key] ?? ""}
                                                onChange={(e) => setEditableFields(p => ({ ...p, [field.key]: e.target.value }))}
                                                className="w-full bg-[#0a101d] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Apply Button */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleApply}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                            >
                                אשר מפרט והמשך ליצירת המודעה <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
