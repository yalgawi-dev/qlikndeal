"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronRight, Check, Edit2 } from "lucide-react";
import { COMPUTER_DATABASE } from "@/lib/computer-data";

// ─── Constants ────────────────────────────────────────────────────
const PORT_OPTIONS = [
    "USB-A 3.2", "USB-A 3.1", "USB-A 2.0",
    "USB-C 3.2", "USB-C Thunderbolt 4", "USB-C Thunderbolt 3",
    "HDMI 2.1", "HDMI 2.0", "HDMI 1.4",
    "DisplayPort 2.0", "DisplayPort 1.4", "Mini DisplayPort",
    "SD Card Reader", "MicroSD Reader",
    "Ethernet (RJ-45)", "Audio Jack 3.5mm", "VGA",
];

const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB", "32GB", "48GB", "64GB", "128GB"];
const STORAGE_OPTIONS = ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD", "1TB HDD", "2TB HDD", "1TB SSD + 1TB HDD"];
const OS_OPTIONS = ["Windows 11 Home", "Windows 11 Pro", "Windows 10 Home", "Windows 10 Pro", "macOS Sequoia", "macOS Sonoma", "macOS Ventura", "macOS Monterey", "Linux", "ללא מערכת הפעלה"];

// ─── Local fuzzy search ───────────────────────────────────────────
function searchLocalDB(q: string, limit = 6): { label: string; data: any }[] {
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
                        if (sku.id && matchesAll(sku.id)) { score += 15; matchedSku = sku; break; }
                    }
                }

                if (score > 0) results.push({ label: sub.name, score, data: { brand, family, sub, matchedSku } });
            }
        }
    }

    results.sort((a, b) => b.score - a.score);
    const seen = new Set<string>();
    return results
        .filter(r => { if (seen.has(r.label)) return false; seen.add(r.label); return true; })
        .slice(0, limit)
        .map(r => ({ label: r.label, data: r.data }));
}

// Build a complete spec object from matched DB entry
function buildSpec(d: { brand: string; family: any; sub: any; matchedSku: any }) {
    const { brand, family, sub, matchedSku } = d;
    return {
        brand,
        model_name: sub.name,
        model_number: matchedSku?.id || "",
        type: family.type || "laptop",
        cpu: matchedSku?.cpu?.join(", ") || sub.cpu?.join(", ") || "",
        gpu: matchedSku?.gpu?.join(", ") || sub.gpu?.join(", ") || "",
        ram: matchedSku?.ram?.[0] || sub.ram?.[0] || "",
        storage: matchedSku?.storage?.[0] || sub.storage?.[0] || "",
        display: sub.display || sub.screenSize?.[0] || "",
        os: matchedSku?.os?.[0] || sub.os?.[0] || "",
        battery_info: sub.battery || "",   // manufacturer battery info (from DB)
        ports_info: sub.ports || "",   // manufacturer ports info (from DB)
        weight: sub.weight || "",
        release_year: sub.release_year || "",
        notes: sub.notes || "",
    };
}

// ─── Spec field definitions (used in the unified form) ───────────
const SPEC_FIELDS = [
    { key: "brand", label: "יצרן", icon: "🏭", kind: "text" },
    { key: "model_name", label: "שם דגם", icon: "🏷️", kind: "text" },
    { key: "model_number", label: "מספר דגם / SKU", icon: "#️⃣", kind: "text" },
    { key: "type", label: "סוג מחשב", icon: "💻", kind: "typeSelect" },
    { key: "cpu", label: "מעבד (CPU)", icon: "⚡", kind: "text" },
    { key: "gpu", label: "כרטיס מסך (GPU)", icon: "🎮", kind: "text" },
    { key: "ram", label: "זיכרון RAM", icon: "🧠", kind: "ramSelect" },
    { key: "storage", label: "אחסון", icon: "💾", kind: "storageSelect" },
    { key: "display", label: "מסך", icon: "🖥️", kind: "text" },
    { key: "os", label: "מערכת הפעלה", icon: "🪟", kind: "osSelect" },
    { key: "battery", label: "סוללה / בריאות", icon: "🔋", kind: "battery" },
    { key: "ports", label: "חיבורים", icon: "🔌", kind: "ports" },
    { key: "weight", label: "משקל", icon: "📐", kind: "text", placeholder: "לדוגמה: 1.8 ק\"ג" },
    { key: "price", label: "מחיר מבוקש (₪)", icon: "💰", kind: "price", placeholder: "הכנס מחיר בש\"ח" },
    { key: "release_year", label: "שנת ייצור", icon: "📅", kind: "text", placeholder: "לדוגמה: 2023" },
    { key: "notes", label: "הערות / תיאור נוסף", icon: "📝", kind: "textarea", placeholder: "תיאור כללי, ליקויים, מה כלול במכירה..." },
];

const TYPE_OPTIONS = ["laptop", "desktop", "workstation", "all-in-one", "mini pc", "gaming laptop", "tablet"];
const BATTERY_OPTIONS = ["תקינה", "לא תקינה", "הכנס % ידנית"];

// ─── Main Component ───────────────────────────────────────────────
export function ComputerSearchUI({ onApplySpecs }: { onApplySpecs: (specs: any) => void }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ label: string; data: any }[]>([]);
    const [showSug, setShowSug] = useState(false);
    const [spec, setSpec] = useState<Record<string, string> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // Special fields state
    const [batteryStatus, setBatteryStatus] = useState("תקינה");
    const [batteryHealth, setBatteryHealth] = useState("");
    const [selectedPorts, setSelectedPorts] = useState<string[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Autocomplete
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) { setSuggestions([]); setShowSug(false); return; }
        debounceRef.current = setTimeout(() => {
            const sug = searchLocalDB(query, 7);
            setSuggestions(sug);
            setShowSug(sug.length > 0);
        }, 220);
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        const h = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setShowSug(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const loadSpec = (data: any) => {
        const s = buildSpec(data);
        setSpec(s);
        setConfirmed(false);
        // Extract ports from DB data if available, pre-select them
        const portsStr = s.ports_info || "";
        const preSelected: string[] = [];
        PORT_OPTIONS.forEach(p => { if (portsStr.toLowerCase().includes(p.toLowerCase().split(" ")[0])) preSelected.push(p); });
        setSelectedPorts(preSelected);
        setBatteryStatus("תקינה");
        setBatteryHealth("");
        setShowSug(false);
    };

    const pickSuggestion = (sug: { label: string; data: any }) => {
        setQuery(sug.label);
        loadSpec(sug.data);
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
                setSpec(data);
                setConfirmed(false);
            } catch (e: any) {
                setError(e.message);
            } finally { setLoading(false); }
        } else {
            const top = searchLocalDB(q, 1);
            if (top.length > 0) { loadSpec(top[0].data); }
            else setError(`"${q}" לא נמצא במאגר. נסה חיפוש פרימיום (לחצן ירוק) או שנה את ניסוח החיפוש.`);
            setLoading(false);
        }
    };

    const updateField = (key: string, val: string) => {
        setSpec(p => p ? { ...p, [key]: val } : p);
        setConfirmed(false);
    };

    const togglePort = (port: string) => {
        setSelectedPorts(prev => prev.includes(port) ? prev.filter(p => p !== port) : [...prev, port]);
        setConfirmed(false);
    };

    const handleApply = () => {
        if (!spec || !confirmed) return;
        const batteryFinal = batteryStatus === "הכנס % ידנית"
            ? `${batteryHealth}% בריאות`
            : batteryStatus;
        onApplySpecs({
            ...spec,
            battery: batteryFinal,
            ports: selectedPorts.join(", ") || spec.ports_info || "",
        });
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div ref={containerRef} style={{
            background: "linear-gradient(135deg,#09090f 0%,#0d1117 60%,#09090f 100%)",
            color: "#e2e8f0", direction: "rtl", borderRadius: "16px",
            border: "1px solid #1e3a5f", boxShadow: "0 12px 40px rgba(0,0,0,.6)"
        }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(90deg,#111827,#0f1629)",
                borderBottom: "1px solid #1e3a5f", padding: "16px 22px",
                display: "flex", alignItems: "center", gap: 14
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12, fontSize: 20, flexShrink: 0,
                    background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>🔍</div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9" }}>
                        חיפוש מחשב – מילוי אוטומטי
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                        חפש דגם → כל הנתונים יימולאו אוטומטית · ערוך לפי הצורך · אשר בסוף
                    </p>
                </div>
                <button
                    onClick={() => setIsPremium(v => !v)}
                    style={{
                        padding: "5px 12px", borderRadius: 20, border: "1px solid",
                        fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                        background: isPremium ? "rgba(16,185,129,.1)" : "rgba(255,255,255,.04)",
                        color: isPremium ? "#34d399" : "#64748b",
                        borderColor: isPremium ? "#34d39960" : "#334155",
                        display: "flex", alignItems: "center", gap: 5
                    }}
                >
                    <Sparkles style={{ width: 13, height: 13 }} />
                    פרימיום AI
                </button>
            </div>

            <div style={{ padding: "18px 22px" }}>
                {/* Search bar */}
                <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && doSearch()}
                            onFocus={() => suggestions.length > 0 && setShowSug(true)}
                            placeholder="הקלד שם דגם, יצרן, SKU... (לדוגמה: Acer Nitro 5)"
                            style={{
                                flex: 1, padding: "10px 14px", borderRadius: 10,
                                border: "1px solid #1e3a5f", background: "#0d1117",
                                color: "#e2e8f0", fontSize: "0.9rem", outline: "none"
                            }}
                        />
                        <button
                            onClick={doSearch} disabled={loading || !query.trim()}
                            style={{
                                padding: "0 20px", borderRadius: 10, border: "none",
                                background: loading ? "#1e3a5f" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
                                color: "white", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap"
                            }}
                        >{loading ? "מחפש..." : "חפש"}</button>
                    </div>

                    {/* Autocomplete */}
                    {showSug && suggestions.length > 0 && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 99,
                            background: "#0d1117", border: "1px solid #1e3a5f", borderRadius: 10,
                            overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.7)"
                        }}>
                            {suggestions.map((sug, i) => (
                                <button key={i}
                                    onMouseDown={e => { e.preventDefault(); pickSuggestion(sug); }}
                                    style={{
                                        display: "block", width: "100%", textAlign: "right",
                                        padding: "9px 14px", background: "none", border: "none",
                                        borderBottom: i < suggestions.length - 1 ? "1px solid #1e3a5f30" : "none",
                                        color: "#c8d8f0", cursor: "pointer", fontSize: "0.85rem"
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#1e3a5f40")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >💻 {sug.label}</button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "#3f1a1a", border: "1px solid #7f1d1d", color: "#fca5a5", marginBottom: 14, fontSize: "0.85rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Unified spec form */}
                {spec && (
                    <div>
                        {/* Model badge row */}
                        <div style={{
                            padding: "12px 16px", borderRadius: "12px 12px 0 0",
                            background: "linear-gradient(135deg,#0f172a,#1a2744)",
                            border: "1px solid #1e3a5f", borderBottom: "none",
                            display: "flex", alignItems: "center", gap: 12
                        }}>
                            <span style={{ fontSize: "1.6rem" }}>💻</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {spec.model_name || query}
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                                    {spec.model_number && (
                                        <span style={{ fontSize: "0.7rem", background: "#6366f115", color: "#a5b4fc", padding: "1px 8px", borderRadius: 20, border: "1px solid #6366f130" }}>
                                            #{spec.model_number}
                                        </span>
                                    )}
                                    {spec.release_year && (
                                        <span style={{ fontSize: "0.7rem", background: "#1e3a5f40", color: "#7ea8d8", padding: "1px 8px", borderRadius: 20, border: "1px solid #1e3a5f" }}>
                                            {spec.release_year}
                                        </span>
                                    )}
                                    <span style={{ fontSize: "0.68rem", color: "#34d399", background: "#34d39912", padding: "1px 8px", borderRadius: 20, border: "1px solid #34d39930" }}>
                                        ✏️ כל השדות ניתנים לעריכה
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Fields */}
                        <div style={{ border: "1px solid #1e3a5f", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                            {SPEC_FIELDS.map((field, idx) => {
                                const val = spec[field.key] ?? "";
                                const bg = idx % 2 === 0 ? "#0a0e18" : "#0d1117";

                                return (
                                    <div key={field.key} style={{ padding: "10px 14px", background: bg, borderBottom: "1px solid #1e3a5f20" }}>
                                        <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                                            <span>{field.icon}</span>
                                            <span style={{ textTransform: "uppercase", letterSpacing: ".04em" }}>{field.label}</span>
                                            {val && field.kind !== "battery" && field.kind !== "ports" && field.kind !== "price" && (
                                                <span style={{ marginRight: "auto", fontSize: "0.6rem", color: "#0ea5e9", background: "#0ea5e915", padding: "1px 6px", borderRadius: 20, border: "1px solid #0ea5e930" }}>
                                                    ממאגר ✓
                                                </span>
                                            )}
                                        </div>

                                        {/* text / default */}
                                        {(field.kind === "text") && (
                                            <input
                                                value={val}
                                                onChange={e => updateField(field.key, e.target.value)}
                                                placeholder={(field as any).placeholder || ""}
                                                style={{
                                                    width: "100%", padding: "6px 10px", borderRadius: 8,
                                                    border: `1px solid ${val ? "#1e3a5f" : "#334155"}`,
                                                    background: val ? "#0a0f1c" : "#111827",
                                                    color: "#e2e8f0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box"
                                                }}
                                            />
                                        )}

                                        {/* Type select */}
                                        {field.kind === "typeSelect" && (
                                            <select value={val} onChange={e => updateField(field.key, e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.85rem", outline: "none" }}>
                                                {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        )}

                                        {/* RAM select */}
                                        {field.kind === "ramSelect" && (
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                <select value={val} onChange={e => updateField(field.key, e.target.value)}
                                                    style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.85rem", outline: "none" }}>
                                                    {RAM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                                <input value={val} onChange={e => updateField(field.key, e.target.value)} placeholder="או הקלד ערך..."
                                                    style={{ width: 110, padding: "6px 8px", borderRadius: 8, border: "1px solid #334155", background: "#111827", color: "#e2e8f0", fontSize: "0.8rem", outline: "none" }} />
                                            </div>
                                        )}

                                        {/* Storage select */}
                                        {field.kind === "storageSelect" && (
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                <select value={val} onChange={e => updateField(field.key, e.target.value)}
                                                    style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.85rem", outline: "none" }}>
                                                    {STORAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                                <input value={val} onChange={e => updateField(field.key, e.target.value)} placeholder="או הקלד..."
                                                    style={{ width: 110, padding: "6px 8px", borderRadius: 8, border: "1px solid #334155", background: "#111827", color: "#e2e8f0", fontSize: "0.8rem", outline: "none" }} />
                                            </div>
                                        )}

                                        {/* OS select */}
                                        {field.kind === "osSelect" && (
                                            <select value={val} onChange={e => updateField(field.key, e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.85rem", outline: "none" }}>
                                                {OS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        )}

                                        {/* Battery */}
                                        {field.kind === "battery" && (
                                            <div>
                                                {spec.battery_info && (
                                                    <div style={{ fontSize: "0.75rem", color: "#7ea8d8", marginBottom: 7, background: "#0ea5e910", padding: "4px 10px", borderRadius: 8, border: "1px solid #0ea5e920" }}>
                                                        📋 לפי יצרן: {spec.battery_info}
                                                    </div>
                                                )}
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: batteryStatus === "הכנס % ידנית" ? 8 : 0 }}>
                                                    {BATTERY_OPTIONS.map(opt => (
                                                        <button key={opt} type="button" onClick={() => setBatteryStatus(opt)}
                                                            style={{
                                                                padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1px solid",
                                                                background: batteryStatus === opt ? (opt === "לא תקינה" ? "#7f1d1d" : opt === "תקינה" ? "#14532d" : "#1e3a5f") : "transparent",
                                                                color: batteryStatus === opt ? (opt === "לא תקינה" ? "#fca5a5" : opt === "תקינה" ? "#86efac" : "#93c5fd") : "#64748b",
                                                                borderColor: batteryStatus === opt ? (opt === "לא תקינה" ? "#7f1d1d" : opt === "תקינה" ? "#166534" : "#1e3a5f") : "#334155"
                                                            }}>
                                                            {opt === "תקינה" ? "✅ תקינה" : opt === "לא תקינה" ? "❌ לא תקינה" : "📊 הכנס %"}
                                                        </button>
                                                    ))}
                                                </div>
                                                {batteryStatus === "הכנס % ידנית" && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                                                        <input type="number" min={1} max={100} value={batteryHealth} onChange={e => setBatteryHealth(e.target.value)}
                                                            placeholder="85"
                                                            style={{ width: 70, padding: "5px 8px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.85rem", outline: "none" }} />
                                                        <span style={{ fontSize: "0.8rem", color: "#93c5fd" }}>% בריאות סוללה</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Ports */}
                                        {field.kind === "ports" && (
                                            <div>
                                                {spec.ports_info && (
                                                    <div style={{ fontSize: "0.73rem", color: "#7ea8d8", marginBottom: 7, background: "#0ea5e910", padding: "4px 10px", borderRadius: 8, border: "1px solid #0ea5e920" }}>
                                                        📋 לפי יצרן: {spec.ports_info}
                                                    </div>
                                                )}
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                                    {PORT_OPTIONS.map(port => {
                                                        const active = selectedPorts.includes(port);
                                                        return (
                                                            <button key={port} type="button" onClick={() => togglePort(port)}
                                                                style={{
                                                                    padding: "3px 9px", borderRadius: 20, fontSize: "0.7rem", cursor: "pointer",
                                                                    border: `1px solid ${active ? "#0ea5e9" : "#334155"}`,
                                                                    background: active ? "#0ea5e920" : "transparent",
                                                                    color: active ? "#38bdf8" : "#64748b", fontWeight: active ? 600 : 400
                                                                }}>
                                                                {active ? "✓ " : ""}{port}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Price */}
                                        {field.kind === "price" && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ color: "#34d399", fontWeight: 800, fontSize: "1.1rem" }}>₪</span>
                                                <input type="number" min={0} value={val}
                                                    onChange={e => updateField(field.key, e.target.value)}
                                                    placeholder={(field as any).placeholder}
                                                    style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.9rem", outline: "none" }} />
                                            </div>
                                        )}

                                        {/* Textarea */}
                                        {field.kind === "textarea" && (
                                            <textarea rows={2} value={val}
                                                onChange={e => updateField(field.key, e.target.value)}
                                                placeholder={(field as any).placeholder}
                                                style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1px solid #1e3a5f", background: "#0a0f1c", color: "#e2e8f0", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Confirmation section ──────────────────── */}
                        <div style={{
                            marginTop: 16, padding: "14px 18px", borderRadius: 12,
                            border: `1px solid ${confirmed ? "#166534" : "#1e3a5f"}`,
                            background: confirmed ? "rgba(22,101,52,.12)" : "rgba(14,165,233,.06)",
                            display: "flex", flexDirection: "column", gap: 12
                        }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                                <div
                                    onClick={() => setConfirmed(v => !v)}
                                    style={{
                                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                        border: `2px solid ${confirmed ? "#34d399" : "#334155"}`,
                                        background: confirmed ? "#16a34a" : "transparent",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all .2s", cursor: "pointer"
                                    }}>
                                    {confirmed && <Check style={{ width: 14, height: 14, color: "white" }} />}
                                </div>
                                <span style={{ fontSize: "0.88rem", color: confirmed ? "#86efac" : "#94a3b8", fontWeight: confirmed ? 600 : 400 }}>
                                    ✅ בדקתי את כל הנתונים – הם נכונים ומדויקים
                                </span>
                            </label>

                            <button
                                onClick={handleApply}
                                disabled={!confirmed}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    padding: "11px 24px", borderRadius: 12, border: "none",
                                    background: confirmed
                                        ? "linear-gradient(135deg,#16a34a,#15803d)"
                                        : "#1e293b",
                                    color: confirmed ? "white" : "#475569",
                                    fontWeight: 700, fontSize: "0.95rem",
                                    cursor: confirmed ? "pointer" : "not-allowed",
                                    boxShadow: confirmed ? "0 0 20px rgba(22,163,74,.35)" : "none",
                                    transition: "all .2s"
                                }}>
                                <ChevronRight style={{ width: 16, height: 16 }} />
                                {confirmed ? "המשך ליצירת המודעה" : "סמן אישור כדי להמשיך"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
