"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, SendHorizontal, Database, CheckCircle2, ArrowRightLeft, HelpCircle } from "lucide-react";
import { WordWeightDebugger } from "./WordWeightDebugger";
import { CATEGORY_CATALOG_CONFIG } from "./UniversalCatalogSearch";
import { toast } from "sonner";

interface SmartAiInputProps {
    isAnalyzing?: boolean;
    onResult: (result: any) => void;
    category?: string; // כשמוגדר — הקומפוננט מבצע את קריאת ה-API בעצמה
}

// Map category → catalog key for quick lookup
const CATEGORY_TO_CATALOG: Record<string, string> = {
    SMARTPHONES: "Phones",
    PHONES: "Phones",
    MOBILES: "Phones",
    LAPTOPS: "Computers",
    DESKTOPS: "Computers",
    AIO: "Computers",
    VEHICLES: "Vehicles",
    ELECTRONICS: "Electronics",
    APPLIANCES: "Appliances",
};

/**
 * SmartAiInput — עובד בשני מצבים:
 * 1. Standalone (create-ai page): category=undefined → מחזיר string גולמי ל-parent
 * 2. Embedded (ListingForm): category מוגדר → קורא /api/analyze ומחזיר אובייקט מפורסר
 */
export function SmartAiInput({ isAnalyzing: externalLoading, onResult, category }: SmartAiInputProps) {
    const [text, setText] = useState("");
    const [internalLoading, setInternalLoading] = useState(false);
    const [catalogMatchLabel, setCatalogMatchLabel] = useState<string | null>(null);
    const [catalogMatches, setCatalogMatches] = useState<{ label: string; details: any }[] | null>(null);

    const isLoading = externalLoading || internalLoading;

    // ─── Catalog-first lookup ───────────────────────────────────────────────
    const fetchCatalogMatches = async (): Promise<{ label: string; details: any }[] | null> => {
        if (!category) return null;
        const catalogKey = CATEGORY_TO_CATALOG[category.toUpperCase()];
        if (!catalogKey) return null;

        try {
            const res = await fetch(`/api/marketplace/catalog-search?q=${encodeURIComponent(text.trim())}&cat=${catalogKey}&t=${Date.now()}`);
            if (!res.ok) return null;
            const results: { label: string; details: any }[] = await res.json();
            return results && results.length > 0 ? results : null;
        } catch {
            return null;
        }
    };

    // Apply the specs of the selected catalog model
    const handleSelectCatalogModel = (match: { label: string; details: any }) => {
        if (!category) return;
        const catalogKey = CATEGORY_TO_CATALOG[category.toUpperCase()];
        const config = CATEGORY_CATALOG_CONFIG[category.toUpperCase()];
        if (!config || !catalogKey) return;

        const mapped = config.mapFields(match.details || match);
        const filtered = Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== ""));

        // הוסף flag שמציין שזה בא מהקטלוג
        onResult({ ...filtered, isCatalogMatch: true, sourceTable: catalogKey });
        setCatalogMatchLabel(match.label);
        setCatalogMatches(null);
    };

    // Skip catalog matches and run the standard AI analysis
    const handleContinueWithAI = async () => {
        setCatalogMatches(null);
        setInternalLoading(true);
        setCatalogMatchLabel(null);
        try {
            await runAiAnalysis();
        } finally {
            setInternalLoading(false);
        }
    };

    const runAiAnalysis = async () => {
        try {
            const response = await fetch("/api/marketplace/analyze", {
                method: "POST",
                body: JSON.stringify({ text: text.trim(), category: category }),
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error || `שגיאת שרת (${response.status})`;
                toast.error(`ניתוח המודעה נכשל: ${errMsg}`);
                return;
            }

            const data = await response.json();
            if (data.success && data.result) {
                try {
                    const logRes = await fetch("/api/parser-log", {
                        method: "POST",
                        body: JSON.stringify({
                            originalText: text.trim(),
                            aiParsed: JSON.stringify(data.result),
                            category: data.result.category || category || "GENERAL",
                            inputMode: "טופס_פנימי"
                        }),
                        headers: { "Content-Type": "application/json" }
                    });
                    const logData = await logRes.json();
                    if (logData.id) {
                        localStorage.setItem("currentParserLogId", logData.id);
                    }
                } catch (e) {
                    console.error("Failed to create initial parser log:", e);
                }

                onResult(data.result);
                toast.success("פרטי המודעה נותחו בהצלחה והוזנו לטופס! 🎉");
            } else {
                toast.error(data.error || "לא הצלחנו לנתח את פרטי המודעה הזו. אנא וודא שהטקסט מכיל מידע רלוונטי.");
            }
        } catch (e: any) {
            console.error("SmartAiInput analyze error:", e);
            toast.error(`שגיאת רשת: לא הצלחנו לתקשר עם שרת הניתוח (${e.message || "בדוק חיבור רשת"})`);
        }
    };

    const handleButtonClick = async () => {
        if (!text || text.trim().length < 5) return;

        if (category !== undefined) {
            setInternalLoading(true);
            setCatalogMatchLabel(null);
            setCatalogMatches(null);
            try {
                // ── שלב 1: חיפוש בקטלוג (Catalog-First) ──────────────
                const matches = await fetchCatalogMatches();
                if (matches && matches.length > 0) {
                    // נמצאו דגמים תואמים בקטלוג — נציג למשתמש לבחור!
                    setCatalogMatches(matches);
                    setInternalLoading(false);
                    return;
                }

                // ── שלב 2: Fallback ל-AI ──────────────────────────────────
                await runAiAnalysis();
            } catch (e: any) {
                console.error("SmartAiInput analyze error:", e);
                toast.error(`תקלה בתהליך הניתוח: ${e.message || "נסה שוב"}`);
            } finally {
                setInternalLoading(false);
            }
        } else {
            // מצב עצמאי — בדף create-ai: מחזיר טקסט גולמי ל-parent
            onResult(text.trim());
        }
    };

    return (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 shadow-2xl relative overflow-visible group">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />

            <div className="flex items-center gap-3 mb-4 text-right justify-end" dir="rtl">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-end">
                        מילוי מהיר בעזרת AI
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </h3>
                    <p className="text-xs text-indigo-200/70">הדבק תיאור חופשי והטופס יתמלא לבד</p>
                </div>
            </div>

            {/* ── Catalog match selector (בחירת דגם מהקטלוג) ───────────────── */}
            {catalogMatches && catalogMatches.length > 0 && (
                <div className="mb-5 p-5 rounded-xl bg-black/60 border border-indigo-500/40 shadow-xl space-y-4" dir="rtl">
                    <div className="flex items-center gap-2 text-indigo-300">
                        <Database className="w-5 h-5 text-indigo-400 shrink-0" />
                        <span className="font-bold text-sm">נמצאו דגמים מתאימים בקטלוג! בחר את הדגם המדויק:</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catalogMatches.map((match, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectCatalogModel(match)}
                                className="flex items-center justify-between p-3.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 hover:border-indigo-400/60 text-right text-xs text-gray-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 group/btn"
                            >
                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap ml-2">
                                    <span dir="ltr" className="inline-block text-white font-semibold group-hover/btn:text-indigo-200">
                                        {match.label}
                                    </span>
                                </span>
                                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400/60 group-hover/btn:text-indigo-300 shrink-0" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-indigo-500/10">
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                            בחירת דגם תטען את המפרט המלא מהקטלוג באופן מיידי.
                        </p>
                        <button
                            type="button"
                            onClick={handleContinueWithAI}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                        >
                            <span>לא מצאתי? נתח כמודעה חופשית עם AI</span>
                            <Sparkles className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Catalog match banner ──────────────────────────────────── */}
            {catalogMatchLabel && !catalogMatches && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30" dir="rtl">
                    <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex-1 text-right">
                        <p className="text-emerald-300 text-sm font-bold">מולא אוטומטית מהקטלוג ✅</p>
                        <p className="text-emerald-500/70 text-xs mt-0.5">
                            <span dir="ltr" className="inline-block text-emerald-300 font-semibold">{catalogMatchLabel}</span> — כל הנתונים הידועים הוטענו
                        </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
            )}

            <div className="relative space-y-4">
                <Textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        // איפוס בחירות קודמות אם הטקסט משתנה
                        if (catalogMatches) setCatalogMatches(null);
                    }}
                    placeholder="למשל: למכירה אייפון 15 פרו כחול, 256GB, סוללה 100%, מבקש 3800..."
                    className="bg-black/40 border-gray-700 focus:border-indigo-500 min-h-[160px] text-right text-lg text-gray-100 placeholder:text-gray-600 rounded-xl resize-none p-4 pb-16 transition-all"
                    dir="rtl"
                />

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <Button
                        type="button"
                        onClick={handleButtonClick}
                        disabled={isLoading || text.length < 5}
                        className="bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-none px-6 py-5 rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span className="font-bold">נתח מודעה</span>
                                <SendHorizontal className="w-4 h-4 mr-2 rotate-180" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
            {/* Added system testing Word Weights debugger tooltip engine */}
            <WordWeightDebugger text={text} category={category} />
        </div>
    );
}