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

// ─── Main Component ───────────────────────────────────────────────
export function ComputerSearchUI({ onApplySpecs }: { onApplySpecs: (specs: any) => void }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ label: string; data: any }[]>([]);
    const [showSug, setShowSug] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);

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
        // Map the db fields to standard names correctly and pass raw directly to the parent
        onApplySpecs({ ...s, battery: s.battery_info, ports: s.ports_info, notes: s.notes });
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
                onApplySpecs(data);
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

            </div>
        </div>
    );
}
