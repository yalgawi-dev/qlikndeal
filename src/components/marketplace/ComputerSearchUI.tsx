import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, Check, Zap, Sparkles, X, ChevronRight } from "lucide-react";

export const COMPUTER_SEARCH_FIELDS = [
    { key: "model_name", label: "שם הדגם", icon: "🏷️", locked: true },
    { key: "model_number", label: "מספר דגם / SKU", icon: "#️⃣", locked: true },
    { key: "type", label: "סוג מחשב", icon: "💻", locked: true },
    { key: "cpu", label: "מעבד (CPU)", icon: "⚡", locked: true },
    { key: "gpu", label: "כרטיס מסך (GPU)", icon: "🎮", locked: true },
    { key: "ram", label: "זיכרון RAM", icon: "🧠", locked: false, options: ["ללא ידוע", "4GB", "8GB", "16GB", "32GB", "64GB"] },
    { key: "storage", label: "אחסון", icon: "💾", locked: false, options: ["ללא ידוע", "128GB", "256GB", "512GB", "1TB", "2TB"] },
    { key: "display", label: "מסך", icon: "🖥️", locked: true },
    { key: "battery", label: "סוללה", icon: "🔋", locked: true },
    { key: "os", label: "מערכת הפעלה", icon: "🪟", locked: false, options: ["ללא מערכת הפעלה", "Windows 10", "Windows 11 Home", "Windows 11 Pro", "macOS", "Linux"] },
    { key: "ports", label: "חיבורים", icon: "🔌", locked: true },
    { key: "weight", label: "משקל / מימדים", icon: "📐", locked: true },
    { key: "price", label: "מחיר משוער", icon: "💰", locked: true },
    { key: "release_year", label: "שנת השקה", icon: "📅", locked: true },
    { key: "notes", label: "הערות נוספות", icon: "📝", locked: true },
];

export function ComputerSearchUI({ onApplySpecs }: { onApplySpecs: (specs: any) => void }) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);

    // Editable State overrides
    const [editableFields, setEditableFields] = useState<Record<string, string>>({});

    const doSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setEditableFields({});

        try {
            if (isPremium) {
                // Call Premium API
                const response = await fetch("/api/marketplace/premium-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query, category: "computer" })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setResult(data);

                // Set initial values for editable fields
                setEditableFields({
                    ram: data.ram || "ללא ידוע",
                    storage: data.storage || "ללא ידוע",
                    os: data.os || "ללא מערכת הפעלה"
                });
            } else {
                // Mock free local search for now (Simulated from internal database)
                // Assuming we would use `allModelsFlat` filtering here. 
                // For demonstration to flow into the form, just throw an error suggesting Premium if no exact local match
                throw new Error("מנוע החינמי עדיין אינו מחובר לכל המאגר. אנא הפעל חיפוש פרימיום (לחצן ירוק) כדי לחפש מפרט עמוק ברשת.");
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
        if (!type) return "💻";
        const t = type.toLowerCase();
        if (t.includes("laptop") || t.includes("notebook")) return "💻";
        if (t.includes("desktop")) return "🖥️";
        if (t.includes("mini")) return "📦";
        return "💻";
    };

    return (
        <div style={{
            background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)",
            color: "#e2e8f0",
            direction: "rtl",
            borderRadius: "16px",
            border: "1px solid #1e3a5f",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)",
                borderBottom: "1px solid #1e3a5f",
                padding: "20px 24px",
                display: "flex", alignItems: "center", gap: "16px",
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                }}>🔍</div>
                <div className="flex-1">
                    <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>
                        מנוע חיפוש מפרט מחשב
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                        חפש דגם נתון והמנוע ישלוף את כל הנתונים (Ram, Os יהיו ניתנים לעריכה)
                    </p>
                </div>

                {/* Premium Toggle */}
                <button
                    onClick={() => setIsPremium(!isPremium)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${isPremium
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300'}`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    פרימיום AI ברשת
                </button>
            </div>

            <div style={{ padding: "24px" }}>
                {/* Search Input Bar */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && doSearch()}
                        placeholder='הזן SKU, דגם או מפרט חלקי... (לדוגמה 82V700DGIX)'
                        style={{
                            width: "100%", padding: "12px 16px", borderRadius: "12px",
                            border: "1px solid #1e3a5f", background: "#0d1117",
                            color: "#e2e8f0", fontSize: "0.95rem", outline: "none",
                        }}
                    />
                    <button
                        onClick={doSearch}
                        disabled={loading || !query.trim()}
                        style={{
                            padding: "0 24px", borderRadius: "12px", border: "none",
                            background: loading ? "#1e3a5f" : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            color: "white", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "מחפש..." : "חפש"}
                    </button>
                </div>

                {error && (
                    <div style={{ padding: "16px", borderRadius: "12px", background: "#3f1a1a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Results UI */}
                {result && !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div style={{
                            padding: "16px 20px", borderRadius: "12px 12px 0 0",
                            background: "linear-gradient(135deg, #0f172a, #1e293b)",
                            border: "1px solid #1e3a5f", borderBottom: "none",
                            display: "flex", alignItems: "center", gap: "12px",
                        }}>
                            <span style={{ fontSize: "1.8rem" }}>{getTypeIcon(result.type)}</span>
                            <div className="flex-1">
                                <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#f1f5f9" }}>{result.model_name || query}</h2>
                                <span style={{ fontSize: "0.78rem", background: "#6366f120", color: "#a5b4fc", padding: "2px 10px", borderRadius: "20px", border: "1px solid #6366f140" }}>
                                    #{result.model_number || "SKU לא ידוע"}
                                </span>
                            </div>
                        </div>

                        {/* Editable Tables Grid */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                            gap: "1px", background: "#1e3a5f", border: "1px solid #1e3a5f", borderTop: "none",
                            borderRadius: "0 0 12px 12px", overflow: "hidden",
                        }}>
                            {COMPUTER_SEARCH_FIELDS.filter(f => !["type", "model_name", "model_number"].includes(f.key)).map((field) => (
                                <div key={field.key} style={{ padding: "12px 16px", background: "#0d1117", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "0.95rem" }}>{field.icon}</span>
                                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{field.label}</span>
                                        {!field.locked && <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 mr-auto">ניתן לעריכה</span>}
                                    </div>

                                    {/* Display locked text or editable dropdown/input */}
                                    {field.locked ? (
                                        <div style={{ fontSize: "0.85rem", color: result[field.key] ? "#e2e8f0" : "#334155" }}>
                                            {field.key === "price" && result[field.key] ? <span className="text-emerald-400">{result[field.key]}</span> : (result[field.key] || "—")}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {/* Since we allow user flexibility, we use an input that they can type inside, combined with a quick list. But for simplicity, we use a basic input with a fallback value from AI */}
                                            <input
                                                value={editableFields[field.key] ?? result[field.key] ?? ""}
                                                onChange={(e) => setEditableFields(p => ({ ...p, [field.key]: e.target.value }))}
                                                className="w-full bg-[#1a2235] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-purple-500 outline-none"
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
