"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Search, Loader2, CheckCircle2, Database, X, AlertTriangle } from "lucide-react";

// ─── Category → Catalog configuration ────────────────────────────────────────
// Maps the DynamicListingForm `category` value  →  internal catalog key + field mapper
export const CATEGORY_CATALOG_CONFIG: Record<string, {
    catalogKey: string;
    subCategory?: string;
    placeholder: string;
    icon: string;
    premiumCategory: string;
    mapFields: (d: any) => Record<string, string>;
}> = {
    LAPTOPS: {
        catalogKey: "Computers",
        subCategory: "laptop",
        placeholder: "הקלד שם דגם, יצרן, SKU... (לדוגמה: Dell XPS 15)",
        icon: "💻",
        premiumCategory: "computer",
        mapFields: (d) => ({
            brand:        d.brand || d.יצרן || "",
            family:       d.series || d.family || "",
            subModel:     d.modelName || d.model_name || d.model || "",
            sku:          d.sku || d.model_number || "",
            cpu:          Array.isArray(d.cpu) ? d.cpu[0] : (d.cpu || d.מעבד || ""),
            gpu:          Array.isArray(d.gpu) ? d.gpu[0] : (d.gpu || ""),
            ram:          Array.isArray(d.ram) ? d.ram[0] : (d.ram || d.RAM || ""),
            storage:      Array.isArray(d.storage) ? d.storage[0] : (d.storage || d["נפח אחסון"] || ""),
            // תיקון: screenSize הוא Array (["16"]) — חלץ [0] והוסף סימן "
            screen:       (Array.isArray(d.screenSize) ? d.screenSize[0] + '"' : (d.screenSize ? d.screenSize + '"' : "")) || d.display || d["גודל מסך"] || "",
            os:           Array.isArray(d.os) ? d.os[0] : (d.os || d["מערכת הפעלה"] || ""),
            battery:      d.battery || d.battery_info || "",
            weight:       d.weight || d.משקל || "",
            release_year: d.releaseYear || d.release_year || d["שנת השקה"] || "",
            ports:        d.ports || d.notes || d.חיבורים || "",
        })
    },
    DESKTOPS: {
        catalogKey: "Computers",
        subCategory: "desktop",
        placeholder: "הקלד שם דגם, יצרן, SKU... (לדוגמה: HP ProDesk 400)",
        icon: "🖥️",
        premiumCategory: "computer",
        mapFields: (d) => ({
            brand:        d.brand || d.יצרן || "",
            family:       d.series || d.family || "",
            subModel:     d.modelName || d.model_name || d.model || "",
            sku:          d.sku || d.model_number || "",
            cpu:          Array.isArray(d.cpu) ? d.cpu[0] : (d.cpu || d.מעבד || ""),
            gpu:          Array.isArray(d.gpu) ? d.gpu[0] : (d.gpu || ""),
            ram:          Array.isArray(d.ram) ? d.ram[0] : (d.ram || d.RAM || ""),
            storage:      Array.isArray(d.storage) ? d.storage[0] : (d.storage || ""),
            os:           Array.isArray(d.os) ? d.os[0] : (d.os || d["מערכת הפעלה"] || ""),
            release_year: d.releaseYear || d.release_year || d["שנת השקה"] || "",
            ports:        d.ports || d.notes || "",
        })
    },
    AIO: {
        catalogKey: "Computers",
        subCategory: "aio",
        placeholder: "הקלד שם דגם, יצרן, SKU... (לדוגמה: iMac M3, HP Pavilion AIO)",
        icon: "🖥️",
        premiumCategory: "computer",
        mapFields: (d) => ({
            brand:        d.brand || d.יצרן || "",
            family:       d.series || d.family || "",
            subModel:     d.modelName || d.model_name || d.model || "",
            sku:          d.sku || d.model_number || "",
            cpu:          Array.isArray(d.cpu) ? d.cpu[0] : (d.cpu || ""),
            gpu:          Array.isArray(d.gpu) ? d.gpu[0] : (d.gpu || ""),
            ram:          Array.isArray(d.ram) ? d.ram[0] : (d.ram || ""),
            storage:      Array.isArray(d.storage) ? d.storage[0] : (d.storage || ""),
            screen:       (Array.isArray(d.screenSize) ? d.screenSize[0] + '"' : (d.screenSize ? d.screenSize + '"' : "")) || d.display || "",
            os:           Array.isArray(d.os) ? d.os[0] : (d.os || ""),
            release_year: d.releaseYear || d.release_year || "",
        })
    },
    PHONES: {
        catalogKey: "Phones",
        placeholder: "הקלד שם דגם, יצרן, SKU... (לדוגמה: iPhone 15 Pro, Samsung S24)",
        icon: "📱",
        premiumCategory: "mobile",
        mapFields: (d) => ({
            brand:         d.brand || d.יצרן || "",
            family:        d.series || d.family || "",
            subModel:      d.modelName || d.model_name || d.model || d.דגם || "",
            sku:           d.sku || d.model_number || d["מספר דגם"] || "",
            cpu:           d.cpu || d.מעבד || "",
            ram:           d.ramG ? `${d.ramG}GB` : (d.ram || d.RAM || ""),
            storage:       Array.isArray(d.storages) ? d.storages.join(" / ") : (d.storage || d["נפח אחסון"] || ""),
            screen:        d.screenSize ? `${d.screenSize}"` : (d.display || d.מסך || ""),
            battery:       d.battery || d.סוללה || "",
            rear_camera:   d.rearCamera || d["מצלמה אחורית"] || "",
            front_camera:  d.frontCamera || d["מצלמה קדמית"] || "",
            os:            d.os || d["מערכת הפעלה"] || "",
            release_year:  d.releaseYear?.toString() || d["שנת השקה"] || "",
            network:       d.network || d.קישוריות || "",
            dimensions:    d.dimensions || d["מימדים ומשקל"] || "",
            colors:        d.צבעים || "",
        })
    },
    // ⚡ תיקון קריטי: הטופס שולח category="SMARTPHONES" אבל הcconfig לא הכיר את הvalue הזה
    // → בלי הזה UniversalCatalogSearch מחזיר null ולא מרונדר כלל עבור קטגוריית סמארטפונים
    SMARTPHONES: {
        catalogKey: "Phones",
        placeholder: "הקלד שם דגם, יצרן, SKU... (לדוגמה: iPhone 15 Pro, Samsung S24)",
        icon: "📱",
        premiumCategory: "mobile",
        mapFields: (d) => ({
            brand:         d.brand || d.יצרן || "",
            family:        d.series || d.family || "",
            subModel:      d.modelName || d.model_name || d.model || d.דגם || "",
            sku:           d.sku || d.model_number || d["מספר דגם"] || "",
            cpu:           d.cpu || d.מעבד || "",
            ram:           d.ramG ? `${d.ramG}GB` : (d.ram || d.RAM || ""),
            storage:       Array.isArray(d.storages) ? d.storages.join(" / ") : (d.storage || d["נפח אחסון"] || ""),
            screen:        d.screenSize ? `${d.screenSize}"` : (d.display || d.מסך || ""),
            battery:       d.battery || d.סוללה || "",
            rear_camera:   d.rearCamera || d["מצלמה אחורית"] || "",
            front_camera:  d.frontCamera || d["מצלמה קדמית"] || "",
            os:            d.os || d["מערכת הפעלה"] || "",
            release_year:  d.releaseYear?.toString() || d["שנת השקה"] || "",
            network:       d.network || d.קישוריות || "",
        })
    },
    MOBILES: {
        catalogKey: "Phones",
        placeholder: "הקלד שם דגם, יצרן, SKU... (לדוגמה: iPhone 15 Pro)",
        icon: "📱",
        premiumCategory: "mobile",
        mapFields: (d) => ({
            brand:        d.brand || d.יצרן || "",
            subModel:     d.modelName || d.model_name || d.model || "",
            ram:          d.ramG ? `${d.ramG}GB` : (d.ram || ""),
            storage:      Array.isArray(d.storages) ? d.storages.join(" / ") : (d.storage || ""),
            screen:       d.screenSize ? `${d.screenSize}"` : "",
            battery:      d.battery || "",
            release_year: d.releaseYear?.toString() || "",
        })
    },
    VEHICLES: {
        catalogKey: "Vehicles",
        placeholder: "הקלד מותג ודגם... (לדוגמה: Toyota Corolla 2022)",
        icon: "🚗",
        premiumCategory: "vehicle",
        mapFields: (d) => ({
            brand:        d.make || d.brand || d.יצרן || "",
            subModel:     d.model || d.model_name || d.דגם || "",
            release_year: d.year?.toString() || d["שנת ייצור"] || "",
            fuel_type:    d.fuelType || d.fuel || d["סוג מנוע"] || "",
            transmission: d.transmission || d["תיבת הילוכים"] || "",
            engine_size:  d.engineSize || d["נפח מנוע"] || "",
            hp:           d.hp?.toString() || d["כוחות סוס"] || "",
            type:         d.type || d["סוג רכב"] || "",
        })
    },
    ELECTRONICS: {
        catalogKey: "Electronics",
        placeholder: "הקלד שם מוצר, יצרן, דגם... (לדוגמה: Samsung 55\" QLED)",
        icon: "🔌",
        premiumCategory: "electronics",
        mapFields: (d) => ({
            brand:        d.brand || d.יצרן || "",
            subModel:     d.modelName || d.model || "",
            category:     d.category || d.קטגוריה || "",
            release_year: d.releaseYear?.toString() || d["שנת השקה"] || "",
            specs:        typeof d.specs === "object" ? JSON.stringify(d.specs) : (d.specs || d.מפרט || ""),
        })
    },
    APPLIANCES: {
        catalogKey: "Appliances",
        placeholder: "הקלד שם מוצר, יצרן, דגם... (לדוגמה: LG מקרר 500L)",
        icon: "🏠",
        premiumCategory: "appliance",
        mapFields: (d) => ({
            brand:         d.brand || d.יצרן || "",
            subModel:      d.modelName || d.model || "",
            category:      d.category || d.קטגוריה || "",
            capacity:      d.capacity || d.קיבולת || "",
            energy_rating: d.energyRating || d["דירוג אנרגטי"] || "",
        })
    },
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface UniversalCatalogSearchProps {
    category: string;
    onApplySpecs: (mappedFields: Record<string, string>) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function UniversalCatalogSearch({ category, onApplySpecs }: UniversalCatalogSearchProps) {
    const config = CATEGORY_CATALOG_CONFIG[category];

    // ─── ALL hooks must be called unconditionally (React Rules of Hooks) ─────
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ label: string; data: any; isCatalog?: boolean }[]>([]);
    const [showSug, setShowSug] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedLabel, setAppliedLabel] = useState<string>("");
    const [premiumLoading, setPremiumLoading] = useState(false);
    // תיקון overflow clipping: שמירת מיקום בסיס viewport ל-dropdown
    const [ddCoords, setDdCoords] = useState({ top: 0, left: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    // מונע re-search לאחר בחירת פריט מהקטלוג
    const justAppliedRef = useRef(false);

    // ─── Autocomplete from DB ────────────────────────────────────────────────
    useEffect(() => {
        if (!config) return;
        // אם זה עניין שהוגדר מקידום — בלום re-search
        if (justAppliedRef.current) {
            justAppliedRef.current = false;
            setSuggestions([]);
            setShowSug(false);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const q = query.trim();
        if (q.length < 1) { setSuggestions([]); setShowSug(false); return; }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Use REST API instead of server action (avoids middleware edge cases)
                const params = new URLSearchParams({
                    q,
                    cat: config.catalogKey,
                    ...(config.subCategory ? { sub: config.subCategory } : {}),
                    t: Date.now().toString()
                });
                const res = await fetch(`/api/marketplace/catalog-search?${params}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const dbResults: { label: string; details: any }[] = await res.json();

                if (dbResults.length > 0) {
                    setSuggestions(dbResults.map(item => ({
                        label: item.label,
                        data: item.details || item,
                        isCatalog: true
                    })));
                    setShowSug(true);
                } else {
                    setSuggestions([]);
                    if (q.length >= 3) setShowSug(true); else setShowSug(false);
                }
            } catch (e) {
                console.error("[CatalogSearch] fetch error", e);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(debounceRef.current as any);
    }, [query, config]);

    // ─── Close dropdown on outside click ────────────────────────────────────
    useEffect(() => {
        const h = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setShowSug(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // ─── Reset כשמחליפים קטגוריה ────────────────────────────────────────────
    useEffect(() => {
        setQuery("");
        setSuggestions([]);
        setShowSug(false);
        setApplied(false);
        setAppliedLabel("");
        setError(null);
        justAppliedRef.current = false;
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, [category]);

    // חישוב מיקום ה-dropdown בסיס viewport (להימנע clipping על ידי overflow ב-parent)
    useEffect(() => {
        if (showSug && searchBarRef.current) {
            const rect = searchBarRef.current.getBoundingClientRect();
            setDdCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        }
    }, [showSug, query]);

    // ─── Apply a catalog result → form fields ───────────────────────────────
    const applyResult = useCallback((rawData: any, label: string) => {
        if (!config) return;
        const mapped = config.mapFields(rawData);
        const filtered = Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== ""));
        onApplySpecs(filtered);
        setAppliedLabel(label);
        setApplied(true);
        setShowSug(false);
        setError(null);
        justAppliedRef.current = true;  // חסום re-search בגלל setQuery
        setQuery(label);
    }, [config, onApplySpecs]);

    // ─── NOW it's safe to return null (after all hooks) ─────────────────────
    if (!config) return null;

    const pickSuggestion = (sug: { label: string; data: any }) => {
        setQuery(sug.label);
        applyResult(sug.data, sug.label);
    };

    // ─── Premium AI search ───────────────────────────────────────────────────
    const doPremiumSearch = async () => {
        const q = query.trim();
        if (!q) return;
        setPremiumLoading(true);
        setError(null);
        setShowSug(false);
        try {
            const res = await fetch("/api/marketplace/premium-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, category: config.premiumCategory })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            applyResult(data, q);
        } catch (e: any) {
            setError("חיפוש פרימיום נכשל: " + e.message);
        } finally {
            setPremiumLoading(false);
        }
    };

    // ─── Clear applied state ──────────────────────────────────────────────────
    const clearApplied = () => {
        setApplied(false);
        setAppliedLabel("");
        setQuery("");
        setSuggestions([]);
        setShowSug(false);
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div
            ref={containerRef}
            className="rounded-2xl overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #09090f 0%, #0d1117 60%, #09090f 100%)",
                border: "1px solid #1e3a5f",
                boxShadow: "0 12px 40px rgba(0,0,0,.6)",
                direction: "rtl"
            }}
        >
            {/* ── Header ── */}
            <div style={{
                background: "linear-gradient(90deg, #111827, #0f1629)",
                borderBottom: "1px solid #1e3a5f",
                padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 12
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12, fontSize: 20, flexShrink: 0,
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    {config.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" }}>
                        חיפוש קטלוג – מילוי אוטומטי
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                        חפש דגם מהקטלוג ← כל הנתונים ימולאו אוטומטית · ערוך לפי הצורך · אשר בסוף
                    </p>
                </div>

                {/* Premium AI toggle button */}
                <button
                    type="button"
                    onClick={() => setIsPremium(v => !v)}
                    style={{
                        padding: "5px 12px", borderRadius: 20, border: "1px solid",
                        fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                        background: isPremium ? "rgba(16,185,129,.15)" : "rgba(255,255,255,.04)",
                        color: isPremium ? "#34d399" : "#64748b",
                        borderColor: isPremium ? "#34d39960" : "#334155",
                        display: "flex", alignItems: "center", gap: 5,
                        transition: "all 0.2s ease"
                    }}
                >
                    <Sparkles style={{ width: 12, height: 12 }} />
                    פרימיום AI
                </button>
            </div>

            <div style={{ padding: "16px 20px" }}>

                {/* ── Applied banner ── */}
                {applied && (
                    <div style={{
                        marginBottom: 12, padding: "10px 14px",
                        borderRadius: 10, background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.35)",
                        display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem"
                    }}>
                        <CheckCircle2 style={{ width: 16, height: 16, color: "#34d399", flexShrink: 0 }} />
                        <span style={{ color: "#a7f3d0", flex: 1 }}>
                            ✅ <strong>{appliedLabel}</strong> – הנתונים הוטענו אוטומטית לטופס
                        </span>
                        <button type="button" onClick={clearApplied}
                            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}>
                            <X style={{ width: 14, height: 14 }} />
                        </button>
                    </div>
                )}

                {/* ── Premium info bar ── */}
                {isPremium && !applied && (
                    <div style={{
                        marginBottom: 12, padding: "8px 14px",
                        borderRadius: 10, background: "rgba(234, 179, 8, 0.08)",
                        border: "1px solid rgba(234, 179, 8, 0.2)",
                        fontSize: "0.78rem", color: "#fbbf24"
                    }}>
                        <Sparkles style={{ width: 12, height: 12, display: "inline", marginLeft: 6 }} />
                        מצב פרימיום פעיל – AI יחפש פרטים מלאים עבור דגמים שאינם בקטלוג (שירות בתשלום)
                    </div>
                )}

                {/* ── Search bar ── */}
                <div ref={searchBarRef} style={{ position: "relative", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <input
                                value={query}
                                onChange={e => { setQuery(e.target.value); setApplied(false); }}
                                onKeyDown={e => e.key === "Enter" && (isPremium ? doPremiumSearch() : undefined)}
                                onFocus={() => suggestions.length > 0 && setShowSug(true)}
                                placeholder={config.placeholder}
                                style={{
                                    width: "100%", padding: "10px 40px 10px 14px",
                                    borderRadius: 10, border: "1px solid #1e3a5f",
                                    background: "#0d1117", color: "#e2e8f0",
                                    fontSize: "0.88rem", outline: "none", boxSizing: "border-box"
                                }}
                            />
                            {loading ? (
                                <Loader2 style={{
                                    position: "absolute", right: 12, top: "50%",
                                    transform: "translateY(-50%)", width: 16, height: 16,
                                    color: "#0ea5e9", animation: "spin 1s linear infinite"
                                }} />
                            ) : (
                                <Search style={{
                                    position: "absolute", right: 12, top: "50%",
                                    transform: "translateY(-50%)", width: 15, height: 15,
                                    color: "#334155"
                                }} />
                            )}
                        </div>

                        {isPremium && (
                            <button
                                type="button"
                                onClick={doPremiumSearch}
                                disabled={premiumLoading || !query.trim()}
                                style={{
                                    padding: "0 18px", borderRadius: 10, border: "none",
                                    background: premiumLoading ? "#1e3a5f" : "linear-gradient(135deg, #f59e0b, #d97706)",
                                    color: "white", fontWeight: 700, fontSize: "0.82rem",
                                    cursor: premiumLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                                    display: "flex", alignItems: "center", gap: 6
                                }}
                            >
                                {premiumLoading
                                    ? <><Loader2 style={{ width: 14, height: 14 }} /> מחפש...</>
                                    : <><Sparkles style={{ width: 13, height: 13 }} /> חיפוש AI</>
                                }
                            </button>
                        )}
                    </div>

                    {/* דרופדאון ב-position:fixed כדי להימלט מחיתוך overflow ב-parent */}
                    {showSug && query.trim().length >= 1 && (
                        <div style={{
                            position: "fixed",
                            top: ddCoords.top,
                            left: ddCoords.left,
                            width: ddCoords.width,
                            zIndex: 9999,
                            background: "#0d1117", border: "1px solid #1e3a5f",
                            borderRadius: 10, overflow: "hidden",
                            boxShadow: "0 16px 48px rgba(0,0,0,.85)",
                            maxHeight: 320, overflowY: "auto"
                        }}>
                            {suggestions.length > 0 ? (
                                <>
                                    <div style={{
                                        padding: "6px 14px",
                                        borderBottom: "1px solid #1e3a5f40",
                                        fontSize: "0.68rem",
                                        color: "#475569",
                                        display: "flex", alignItems: "center", gap: 6
                                    }}>
                                        <Database style={{ width: 11, height: 11, color: "#0ea5e9" }} />
                                        <span>תוצאות מהקטלוג הרשמי – גולד סטנדרט</span>
                                    </div>
                                    {suggestions.map((sug, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onMouseDown={e => { e.preventDefault(); pickSuggestion(sug); }}
                                            style={{
                                                display: "flex", width: "100%", textAlign: "right",
                                                padding: "10px 14px", background: "none", border: "none",
                                                borderBottom: i < suggestions.length - 1 ? "1px solid #1e3a5f20" : "none",
                                                color: "#c8d8f0", cursor: "pointer", fontSize: "0.85rem",
                                                alignItems: "center", gap: 8
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#1e3a5f35")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <span style={{ fontSize: "1rem", flexShrink: 0 }}>{config.icon}</span>
                                            <span style={{ flex: 1 }}>{sug.label}</span>
                                            <span style={{
                                                fontSize: "0.6rem", fontWeight: 700,
                                                padding: "2px 6px", borderRadius: 8,
                                                background: "rgba(234,179,8,0.15)",
                                                color: "#fbbf24",
                                                border: "1px solid rgba(234,179,8,0.25)",
                                                flexShrink: 0
                                            }}>
                                                ⭐ קטלוג
                                            </span>
                                        </button>
                                    ))}

                                    {!isPremium && (
                                        <div style={{
                                            padding: "10px 14px",
                                            borderTop: "1px solid #1e3a5f40",
                                            display: "flex", alignItems: "center", gap: 8,
                                            fontSize: "0.75rem", color: "#64748b"
                                        }}>
                                            <Sparkles style={{ width: 12, height: 12, color: "#f59e0b" }} />
                                            <span>לא מצאת? הפעל <strong style={{ color: "#f59e0b" }}>פרימיום AI</strong> לחיפוש מורחב</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ padding: "16px 14px" }}>
                                    <div style={{
                                        display: "flex", alignItems: "flex-start", gap: 10,
                                        marginBottom: isPremium ? 0 : 12
                                    }}>
                                        <AlertTriangle style={{ width: 16, height: 16, color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                                        <div>
                                            <div style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                                                לא נמצא בקטלוג הרשמי
                                            </div>
                                            <div style={{ color: "#64748b", fontSize: "0.78rem", lineHeight: 1.5 }}>
                                                הדגם שחיפשת אינו נמצא בקטלוג שלנו. שים לב: הוספת מוצר ידנית תסומן כ&quot;מפרסם&quot; (ללא אימות קטלוג).
                                            </div>
                                        </div>
                                    </div>
                                    {!isPremium && (
                                        <button
                                            type="button"
                                            onClick={() => setIsPremium(true)}
                                            style={{
                                                marginTop: 10, width: "100%",
                                                padding: "9px 14px", borderRadius: 8,
                                                border: "1px solid rgba(245,158,11,0.4)",
                                                background: "rgba(245,158,11,0.08)",
                                                color: "#fbbf24", fontWeight: 700,
                                                fontSize: "0.82rem", cursor: "pointer",
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center", gap: 6
                                            }}
                                        >
                                            <Sparkles style={{ width: 13, height: 13 }} />
                                            חפש בפרימיום AI (שירות מתקדם)
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Error message ── */}
                {error && (
                    <div style={{
                        padding: "10px 14px", borderRadius: 10,
                        background: "#3f1a1a", border: "1px solid #7f1d1d",
                        color: "#fca5a5", fontSize: "0.82rem",
                        display: "flex", gap: 8, alignItems: "flex-start"
                    }}>
                        <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
                        {error}
                    </div>
                )}

            </div>
        </div>
    );
}
