"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronRight, Check, Edit2 } from "lucide-react";
import { COMPUTER_DATABASE } from "@/lib/computer-data";
import { getAutocomplete, searchLaptops, searchBrandDesktops, searchAio } from "@/app/actions/hardware-search";

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
function searchLocalDB(db: any, q: string, limit = 10): { label: string; data: any }[] {
    if (!q || typeof q !== 'string') return [];
    const queryStr = q.toLowerCase().trim();
    const results: { label: string; score: number; data: any }[] = [];

    for (const brand in db) {
        const brandLower = brand.toLowerCase();
        for (const family of db[brand]) {
            for (const sub of family.subModels) {
                const modelLower = sub.name.toLowerCase();
                const brandLower = brand.toLowerCase();
                const fullName = modelLower.includes(brandLower) ? sub.name.toLowerCase() : `${brandLower} ${modelLower}`;
                let displayLabel = modelLower.toLowerCase().startsWith(brandLower) ? sub.name : `${brand} ${sub.name}`;
                let score = 0;

                // TIER 1: Full name starts with query (e.g. "Apple" or "Acer")
                if (displayLabel.toLowerCase().startsWith(queryStr)) {
                    score = 1000;
                }
                // TIER 2: Any word starts with query (e.g. "Alienware" in "Dell Alienware")
                else if (fullName.split(/\s+/).some((word: string) => word.startsWith(queryStr))) {
                    score = 500;
                }
                // TIER 3: Contains query
                else if (fullName.includes(queryStr)) {
                    score = 100;
                }

                if (score > 0) {
                    results.push({ 
                        label: displayLabel, 
                        score, 
                        data: { brand, family, sub, matchedSku: null } 
                    });
                }
            }
        }
    }

    // Sort: Tier Score (Desc) then Alpha Label (Asc)
    results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.label.localeCompare(b.label, 'en', { sensitivity: 'base' });
    });

    const seen = new Set<string>();
    return results
        .filter(r => { if (seen.has(r.label)) return false; seen.add(r.label); return true; })
        .slice(0, 20)
        .map(r => ({ label: r.label, data: r.data }));
}

// Build a complete spec object from matched DB entry
function buildSpec(d: { brand: string; family: any; sub: any; matchedSku: any }) {
    const { brand, family, sub, matchedSku } = d;
    return {
        brand,
        family: family.name,
        model_name: sub.name,
        model_number: matchedSku?.id || "",
        type: family.type || "laptop",
        cpu: matchedSku?.cpu?.join(", ") || sub.cpu?.join(", ") || "",
        gpu: matchedSku?.gpu?.join(", ") || sub.gpu?.join(", ") || "",
        ram: matchedSku?.ram?.[0] || sub.ram?.[0] || "",
        storage: matchedSku?.storage?.[0] || sub.storage?.[0] || "",
        display: sub.display || sub.screenSize?.[0] || "",
        os: matchedSku?.os?.[0] || sub.os?.[0] || "",
        battery: sub.battery || "",
        ports: sub.ports || "",
        weight: sub.weight || "",
        release_year: sub.release_year || "",
        notes: sub.notes || "",
    };
}

// ─── Main Component ───────────────────────────────────────────────
export function ComputerSearchUI({ activeDb, onApplySpecs, subCategory }: { activeDb: any; onApplySpecs: (specs: any) => void; subCategory?: string }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ label: string; data: any }[]>([]);
    const [showSug, setShowSug] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null as string | null);
    const [isPremium, setIsPremium] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Autocomplete
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const q = query.trim();
        if (q.length < 1) { setSuggestions([]); setShowSug(false); return; }
        
        debounceRef.current = setTimeout(async () => {
            const localResults = searchLocalDB(activeDb, q, 20);
            
            if (localResults.length > 0) {
                setSuggestions(localResults);
                setShowSug(true);
            } else {
                // Try fetching from DB
                const dbNames = await getAutocomplete(q, "Computers", subCategory);
                if (dbNames.length > 0) {
                    // Final client-side sort to be absolutely sure
                    const sortedDbNames = [...dbNames].sort((a, b) => {
                        const aStarts = a.toLowerCase().startsWith(q.toLowerCase());
                        const bStarts = b.toLowerCase().startsWith(q.toLowerCase());
                        if (aStarts && !bStarts) return -1;
                        if (!aStarts && bStarts) return 1;
                        return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });
                    });

                    setSuggestions(sortedDbNames.map(name => ({
                        label: name,
                        data: { name, isFromDb: true }
                    })));
                    setShowSug(true);
                } else {
                    setSuggestions([]);
                    setShowSug(false);
                }
            }
        }, 300);
    }, [query, activeDb, subCategory]);

    // Close dropdown on outside click
    useEffect(() => {
        const h = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setShowSug(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const loadSpec = async (data: any) => {
        if (data.isFromDb) {
            setLoading(true);
            const q = data.name;
            
            // Restrict search based on subCategory to avoid cross-category pollution
            let laptops: any[] = [];
            let desktops: any[] = [];
            let aios: any[] = [];

            if (!subCategory || subCategory === 'laptop') laptops = await searchLaptops(q);
            if (!subCategory || subCategory === 'desktop') desktops = await searchBrandDesktops(q);
            if (!subCategory || subCategory === 'aio') aios = await searchAio(q);
            
            const allResults = [...laptops, ...desktops, ...aios];
            
            if (allResults.length > 0) {
                // Find exact match if possible, otherwise use first
                const exact = allResults.find(r => r.model === q || `${r.brand} ${r.model}` === q) || allResults[0];
                onApplySpecs({
                    brand: exact.brand,
                    family: exact.series,
                    subModel: exact.model,
                    sku: exact.sku,
                    type: exact.type || "",
                    ram: exact.ram,
                    storage: exact.storage,
                    screen: exact.screen,
                    cpu: exact.cpu,
                    gpu: exact.gpu,
                    os: exact.os,
                    release_year: exact.year,
                    ports: exact.notes
                });
            } else {
                // FALLBACK: If search by name failed, something is wrong with the index but we know it's in the DB.
                // Just pass the name and let the user fill manually or try AI.
                onApplySpecs({ subModel: q });
            }
            setLoading(false);
        } else {
            const s = buildSpec(data);
            onApplySpecs({ ...s, battery: (s as any).battery_info || s.battery, ports: (s as any).ports_info || s.ports, notes: s.notes });
        }
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
            const local = searchLocalDB(activeDb, q, 1);
            if (local.length > 0) {
                loadSpec(local[0].data);
            } else {
                // Try database - respect subCategory
                let laptops: any[] = [];
                let desktops: any[] = [];
                let aios: any[] = [];

                if (!subCategory || subCategory === 'laptop') laptops = await searchLaptops(q);
                if (!subCategory || subCategory === 'desktop') desktops = await searchBrandDesktops(q);
                if (!subCategory || subCategory === 'aio') aios = await searchAio(q);
                
                const allResults = [...laptops, ...desktops, ...aios];

                if (allResults.length > 0) {
                    const best = allResults[0];
                     onApplySpecs({
                        brand: best.brand,
                        family: best.series,
                        subModel: best.model,
                        sku: best.sku,
                        type: best.type || "",
                        ram: best.ram,
                        storage: best.storage,
                        screen: best.screen,
                        cpu: best.cpu,
                        gpu: best.gpu,
                        os: best.os,
                        release_year: best.year,
                        ports: best.notes
                    });
                } else {
                    const inMainDbLocal = searchLocalDB(COMPUTER_DATABASE, q, 1);
                    if (inMainDbLocal.length > 0) {
                        setError(`"${q}" נמצא במערכת אך שייך לקטגוריה אחרת - אנא חזור שלב אחורה ובחר בקטגוריה המתאימה.`);
                    } else {
                        setError(`"${q}" לא נמצא במאגר. נסה חיפוש פרימיום AI (לחצן למעלה) או וודא שכתבת נכון.`);
                    }
                }
            }
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
                    {showSug && query.trim().length >= 1 && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, zIndex: 999,
                            background: "#0d1117", border: "1px solid #1e3a5f", borderRadius: 10,
                            overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.7)"
                        }}>
                            {suggestions.length > 0 ? (
                                suggestions.map((sug, i) => (
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
                                ))
                            ) : (
                                <div style={{
                                    padding: "16px", textAlign: "center", color: "#64748b", fontSize: "0.85rem"
                                }}>
                                    לא נמצאו תוצאות בקטגוריה הנוכחית. נסה חיפוש אחר, או ודא שבחרת בקטגוריה הנכונה (חלק מהדגמים נמצאים תחת ניידים / נייחים בלבד).
                                </div>
                            )}
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
