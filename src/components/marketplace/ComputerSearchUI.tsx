"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, ChevronRight, Check, X } from "lucide-react";
import { COMPUTER_DATABASE } from "@/lib/computer-data";

// ─── Field definitions ───────────────────────────────────────────
export const COMPUTER_SEARCH_FIELDS = [
    { key: "model_name", label: "שם הדגם", icon: "🏷️", type: "locked" },
    { key: "model_number", label: "מספר דגם / SKU", icon: "#️⃣", type: "locked" },
    { key: "type", label: "סוג מחשב", icon: "💻", type: "locked" },
    { key: "cpu", label: "מעבד (CPU)", icon: "⚡", type: "locked" },
    { key: "gpu", label: "כרטיס מסך (GPU)", icon: "🎮", type: "locked" },
    {
        key: "ram", label: "זיכרון RAM", icon: "🧠", type: "select",
        options: ["ללא ידוע", "4GB", "6GB", "8GB", "16GB", "24GB", "32GB", "64GB"]
    },
    {
        key: "storage", label: "אחסון", icon: "💾", type: "select",
        options: ["ללא ידוע", "128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "1TB HDD", "2TB HDD"]
    },
    { key: "display", label: "מסך", icon: "🖥️", type: "locked" },
    { key: "battery", label: "סוללה / בריאות", icon: "🔋", type: "battery" },
    {
        key: "os", label: "מערכת הפעלה", icon: "🪟", type: "select",
        options: ["ללא מערכת הפעלה", "Windows 10", "Windows 11 Home", "Windows 11 Pro", "macOS Ventura", "macOS Sonoma", "macOS Sequoia", "Linux"]
    },
    { key: "ports", label: "חיבורים", icon: "🔌", type: "ports" },
    { key: "weight", label: "משקל (ק\"ג)", icon: "📐", type: "text", placeholder: "לדוגמה: 1.8 ק\"ג" },
    { key: "price", label: "מחיר מבוקש (₪)", icon: "💰", type: "price", placeholder: "הכנס מחיר בש\"ח" },
    { key: "release_year", label: "שנת ייצור", icon: "📅", type: "text", placeholder: "לדוגמה: 2023" },
    { key: "notes", label: "הערות נוספות", icon: "📝", type: "textarea", placeholder: "תיאור כללי, ליקויים, מה כלול במכירה..." },
];

const PORT_OPTIONS = [
    "USB-A 3.0", "USB-A 3.1", "USB-A 2.0",
    "USB-C 3.2", "USB-C Thunderbolt 4", "USB-C Thunderbolt 3",
    "HDMI 2.1", "HDMI 2.0", "HDMI 1.4",
    "DisplayPort 2.0", "DisplayPort 1.4",
    "SD Card Reader", "MicroSD",
    "Ethernet (RJ-45)", "Audio Jack 3.5mm",
    "VGA", "Mini DisplayPort",
];

const BATTERY_STATUS_OPTIONS = ["תקינה", "לא תקינה", "אחוז בריאות ידני"];

// ─── Local fuzzy search ───────────────────────────────────────────
function searchLocalDB(q: string, limit = 5): { label: string; data: any }[] {
    const terms = q.toLowerCase().trim().split(/\s+/);
    const matchesAll = (text: string) => text && terms.every(t => text.toLowerCase().includes(t));
    const results: { label: string; score: number; data: any }[] = [];

    for (const brand in COMPUTER_DATABASE) {
        for (const family of COMPUTER_DATABASE[brand]) {
            for (const sub of family.subModels) {
                const fullName = `${brand} ${sub.name}`;
                let score = 0;

                if (matchesAll(sub.name)) {
                    score += 10;
                    if (sub.name.toLowerCase() === q || fullName.toLowerCase() === q) score += 20;
                    else if (sub.name.toLowerCase().startsWith(q) || fullName.toLowerCase().startsWith(q)) score += 5;
                } else if (matchesAll(fullName)) {
                    score += 8;
                }

                let matchedSku: any = null;
                if (sub.skus) {
                    for (const sku of sub.skus) {
                        if (sku.id && matchesAll(sku.id)) {
                            score += 15;
                            matchedSku = sku;
                        }
                    }
                }

                if (score > 0) {
                    results.push({
                        label: sub.name,
                        score,
                        data: { brand, family, sub, matchedSku }
                    });
                }
            }
        }
    }

    results.sort((a, b) => b.score - a.score);
    // Unique by label
    const seen = new Set<string>();
    return results.filter(r => { if (seen.has(r.label)) return false; seen.add(r.label); return true; })
        .slice(0, limit)
        .map(r => ({ label: r.label, data: r.data }));
}

function buildLocalResult(d: { brand: string; family: any; sub: any; matchedSku: any }) {
    const { brand, family, sub, matchedSku } = d;
    return {
        model_name: sub.name,
        model_number: matchedSku?.id || "",
        type: family.type || "laptop",
        cpu: matchedSku?.cpu?.join(", ") || sub.cpu?.join(", ") || "",
        gpu: matchedSku?.gpu?.join(", ") || sub.gpu?.join(", ") || "",
        ram: matchedSku?.ram?.[0] || sub.ram?.[0] || "ללא ידוע",
        storage: matchedSku?.storage?.[0] || sub.storage?.[0] || "ללא ידוע",
        display: sub.display || matchedSku?.screenSize?.[0] || sub.screenSize?.[0] || "",
        os: matchedSku?.os?.[0] || sub.os?.[0] || "ללא מערכת הפעלה",
        battery: sub.battery || "",
        ports: sub.ports || "",
        weight: sub.weight || "",
        price: "",
        release_year: sub.release_year || "",
        notes: sub.notes || ""
    };
}

// ─── Main Component ───────────────────────────────────────────────
export function ComputerSearchUI({ onApplySpecs }: { onApplySpecs: (specs: any) => void }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ label: string; data: any }[]>([]);
    const [showSug, setShowSug] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [editableFields, setEditableFields] = useState<Record<string, string>>({});
    const [selectedPorts, setSelectedPorts] = useState<string[]>([]);
    const [batteryStatus, setBatteryStatus] = useState("תקינה");
    const [batteryHealth, setBatteryHealth] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-complete on query change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) { setSuggestions([]); setShowSug(false); return; }
        debounceRef.current = setTimeout(() => {
            const sug = searchLocalDB(query, 6);
            setSuggestions(sug);
            setShowSug(sug.length > 0);
        }, 250);
        return () => clearTimeout(debounceRef.current as any);
    }, [query]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setShowSug(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const applyResult = (r: any) => {
        setResult(r);
        setEditableFields({
            ram: r.ram,
            storage: r.storage,
            os: r.os,
            weight: r.weight || "",
            price: r.price || "",
            release_year: r.release_year || "",
            notes: r.notes || "",
        });
        setSelectedPorts([]);
        setBatteryStatus("תקינה");
        setBatteryHealth("");
        setShowSug(false);
    };

    const pickSuggestion = (sug: { label: string; data: any }) => {
        setQuery(sug.label);
        applyResult(buildLocalResult(sug.data));
    };

    const doSearch = async () => {
        const q = query.trim();
        if (!q) return;
        setError(null);
        setLoading(true);

        if (isPremium) {
            try {
                const res = await fetch("/api/marketplace/premium-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: q, category: "computer" })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                applyResult(data);
            } catch (e: any) {
                setError(e.message || "שגיאה בחיפוש פרימיום.");
            } finally {
                setLoading(false);
            }
        } else {
            const top = searchLocalDB(q, 1);
            if (top.length > 0) {
                applyResult(buildLocalResult(top[0].data));
            } else {
                setError(`"${q}" לא נמצא במאגר המקומי. נסה חיפוש פרימיום ברשת (לחצן ירוק).`);
            }
            setLoading(false);
        }
    };

    const togglePort = (port: string) => {
        setSelectedPorts(prev =>
            prev.includes(port) ? prev.filter(p => p !== port) : [...prev, port]
        );
    };

    const getTypeIcon = (type: string) => {
        if (!type) return "💻";
        const t = type.toLowerCase();
        if (t.includes("desktop")) return "🖥️";
        if (t.includes("mini")) return "📦";
        return "💻";
    };

    const handleApply = () => {
        if (!result) return;
        const finalBattery = batteryStatus === "אחוז בריאות ידני"
            ? `${batteryHealth}% בריאות`
            : batteryStatus;
        const finalSpec = {
            ...result,
            ...editableFields,
            battery: finalBattery,
            ports: selectedPorts.join(", ") || result.ports || "",
        };
        onApplySpecs(finalSpec);
    };

    const setField = (key: string, val: string) =>
        setEditableFields(p => ({ ...p, [key]: val }));

    // ─── Render ────────────────────────────────────────────────────
    return (
        <div ref={containerRef} style={{
            background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)",
            color: "#e2e8f0", direction: "rtl", borderRadius: "16px",
            border: "1px solid #1e3a5f", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)",
                borderBottom: "1px solid #1e3a5f", padding: "18px 24px",
                display: "flex", alignItems: "center", gap: "16px"
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0
                }}>🔍</div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#f1f5f9" }}>
                        מנוע חיפוש מפרט מחשב
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                        הקלד שם דגם – ההשלמה האוטומטית תעזור לך למצוא במהירות
                    </p>
                </div>
                <button
                    onClick={() => setIsPremium(v => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${isPremium ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50" : "bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300"}`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    פרימיום AI ברשת
                </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
                {/* Search bar with autocomplete */}
                <div style={{ position: "relative", marginBottom: "20px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && doSearch()}
                            onFocus={() => suggestions.length > 0 && setShowSug(true)}
                            placeholder="הקלד שם דגם, יצרן או SKU... (לדוגמה: Acer Nitro 5)"
                            style={{
                                flex: 1, padding: "11px 16px", borderRadius: "10px",
                                border: "1px solid #1e3a5f", background: "#0d1117",
                                color: "#e2e8f0", fontSize: "0.9rem", outline: "none"
                            }}
                        />
                        <button
                            onClick={doSearch}
                            disabled={loading || !query.trim()}
                            style={{
                                padding: "0 22px", borderRadius: "10px", border: "none",
                                background: loading ? "#1e3a5f" : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                                color: "white", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {loading ? "מחפש..." : "חפש"}
                        </button>
                    </div>

                    {/* Autocomplete dropdown */}
                    {showSug && suggestions.length > 0 && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0,
                            background: "#0d1117", border: "1px solid #1e3a5f", borderRadius: "10px",
                            zIndex: 50, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.6)"
                        }}>
                            {suggestions.map((sug, i) => (
                                <button
                                    key={i}
                                    onMouseDown={e => { e.preventDefault(); pickSuggestion(sug); }}
                                    style={{
                                        display: "block", width: "100%", textAlign: "right",
                                        padding: "10px 16px", background: "transparent", border: "none",
                                        borderBottom: i < suggestions.length - 1 ? "1px solid #1e3a5f" : "none",
                                        color: "#c8d8f0", cursor: "pointer", fontSize: "0.88rem"
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#1e3a5f40")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    💻 {sug.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#3f1a1a", border: "1px solid #7f1d1d", color: "#fca5a5", marginBottom: "16px" }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Results */}
                {result && !loading && (
                    <div>
                        {/* Model header */}
                        <div style={{
                            padding: "14px 18px", borderRadius: "12px 12px 0 0",
                            background: "linear-gradient(135deg, #0f172a, #1e293b)",
                            border: "1px solid #1e3a5f", borderBottom: "none",
                            display: "flex", alignItems: "center", gap: "12px"
                        }}>
                            <span style={{ fontSize: "1.8rem" }}>{getTypeIcon(result.type)}</span>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, fontSize: "1.15rem", color: "#f1f5f9" }}>{result.model_name || query}</h2>
                                <span style={{ fontSize: "0.75rem", background: "#6366f120", color: "#a5b4fc", padding: "2px 10px", borderRadius: "20px", border: "1px solid #6366f140" }}>
                                    #{result.model_number || "SKU לא ידוע"}
                                </span>
                            </div>
                        </div>

                        {/* Fields grid */}
                        <div style={{
                            border: "1px solid #1e3a5f", borderTop: "none",
                            borderRadius: "0 0 12px 12px", overflow: "hidden"
                        }}>
                            {COMPUTER_SEARCH_FIELDS.filter(f => !["type", "model_name", "model_number"].includes(f.key)).map((field, idx) => (
                                <div key={field.key} style={{
                                    padding: "12px 16px",
                                    background: idx % 2 === 0 ? "#0d1117" : "#0a0e18",
                                    borderBottom: "1px solid #1e3a5f20"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "0.9rem" }}>{field.icon}</span>
                                        <span style={{ fontSize: "0.73rem", color: "#64748b", fontWeight: 600 }}>{field.label}</span>
                                        {field.type !== "locked" && (
                                            <span style={{ fontSize: "0.65rem", color: "#34d399", background: "#34d39915", padding: "1px 8px", borderRadius: "20px", border: "1px solid #34d39930", marginRight: "auto" }}>
                                                ניתן לעריכה
                                            </span>
                                        )}
                                    </div>

                                    {/* Locked / display-only */}
                                    {field.type === "locked" && (
                                        <div style={{ fontSize: "0.85rem", color: result[field.key] ? "#e2e8f0" : "#334155" }}>
                                            {result[field.key] || "—"}
                                        </div>
                                    )}

                                    {/* Select dropdown */}
                                    {field.type === "select" && (
                                        <select
                                            value={editableFields[field.key] ?? result[field.key] ?? ""}
                                            onChange={e => setField(field.key, e.target.value)}
                                            style={{
                                                width: "100%", padding: "6px 10px", borderRadius: "8px",
                                                border: "1px solid #1e3a5f", background: "#0a0e18",
                                                color: "#e2e8f0", fontSize: "0.85rem", outline: "none"
                                            }}
                                        >
                                            {(field as any).options.map((o: string) => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Battery special field */}
                                    {field.type === "battery" && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                {BATTERY_STATUS_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setBatteryStatus(opt)}
                                                        style={{
                                                            padding: "4px 12px", borderRadius: "20px", border: "1px solid",
                                                            fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                                                            background: batteryStatus === opt
                                                                ? (opt === "לא תקינה" ? "#7f1d1d" : opt === "תקינה" ? "#14532d" : "#1e3a5f")
                                                                : "transparent",
                                                            color: batteryStatus === opt
                                                                ? (opt === "לא תקינה" ? "#fca5a5" : opt === "תקינה" ? "#86efac" : "#93c5fd")
                                                                : "#64748b",
                                                            borderColor: batteryStatus === opt
                                                                ? (opt === "לא תקינה" ? "#7f1d1d" : opt === "תקינה" ? "#14532d" : "#1e3a5f")
                                                                : "#334155"
                                                        }}
                                                    >
                                                        {opt === "תקינה" ? "✅ תקינה" : opt === "לא תקינה" ? "❌ לא תקינה" : "📊 הכנס %"}
                                                    </button>
                                                ))}
                                            </div>
                                            {batteryStatus === "אחוז בריאות ידני" && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <input
                                                        type="number"
                                                        min={1} max={100}
                                                        value={batteryHealth}
                                                        onChange={e => setBatteryHealth(e.target.value)}
                                                        placeholder="לדוגמה: 85"
                                                        style={{
                                                            width: "80px", padding: "5px 8px", borderRadius: "8px",
                                                            border: "1px solid #1e3a5f", background: "#0a0e18",
                                                            color: "#e2e8f0", fontSize: "0.85rem", outline: "none"
                                                        }}
                                                    />
                                                    <span style={{ fontSize: "0.8rem", color: "#93c5fd" }}>% בריאות סוללה</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Ports multi-select */}
                                    {field.type === "ports" && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                            {PORT_OPTIONS.map(port => {
                                                const active = selectedPorts.includes(port);
                                                return (
                                                    <button
                                                        key={port}
                                                        type="button"
                                                        onClick={() => togglePort(port)}
                                                        style={{
                                                            padding: "3px 10px", borderRadius: "20px",
                                                            border: `1px solid ${active ? "#0ea5e9" : "#334155"}`,
                                                            background: active ? "#0ea5e920" : "transparent",
                                                            color: active ? "#38bdf8" : "#64748b",
                                                            fontSize: "0.72rem", cursor: "pointer", fontWeight: active ? 600 : 400
                                                        }}
                                                    >
                                                        {active && "✓ "}{port}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Price field */}
                                    {field.type === "price" && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#34d399", fontWeight: 700, fontSize: "1rem" }}>₪</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={editableFields[field.key] ?? ""}
                                                onChange={e => setField(field.key, e.target.value)}
                                                placeholder={(field as any).placeholder}
                                                style={{
                                                    flex: 1, padding: "6px 10px", borderRadius: "8px",
                                                    border: "1px solid #1e3a5f", background: "#0a0e18",
                                                    color: "#e2e8f0", fontSize: "0.85rem", outline: "none"
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Text input */}
                                    {field.type === "text" && (
                                        <input
                                            value={editableFields[field.key] ?? result[field.key] ?? ""}
                                            onChange={e => setField(field.key, e.target.value)}
                                            placeholder={(field as any).placeholder}
                                            style={{
                                                width: "100%", padding: "6px 10px", borderRadius: "8px",
                                                border: "1px solid #1e3a5f", background: "#0a0e18",
                                                color: "#e2e8f0", fontSize: "0.85rem", outline: "none",
                                                boxSizing: "border-box"
                                            }}
                                        />
                                    )}

                                    {/* Textarea */}
                                    {field.type === "textarea" && (
                                        <textarea
                                            rows={2}
                                            value={editableFields[field.key] ?? result[field.key] ?? ""}
                                            onChange={e => setField(field.key, e.target.value)}
                                            placeholder={(field as any).placeholder}
                                            style={{
                                                width: "100%", padding: "6px 10px", borderRadius: "8px",
                                                border: "1px solid #1e3a5f", background: "#0a0e18",
                                                color: "#e2e8f0", fontSize: "0.85rem", outline: "none",
                                                resize: "vertical", boxSizing: "border-box"
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Apply button */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                            <button
                                onClick={handleApply}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "10px 28px", borderRadius: "12px", border: "none",
                                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                                    color: "white", fontWeight: 700, fontSize: "0.95rem",
                                    cursor: "pointer", boxShadow: "0 0 20px rgba(22,163,74,0.3)"
                                }}
                            >
                                אשר מפרט והמשך ליצירת המודעה
                                <ChevronRight style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
