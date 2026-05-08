"use client";

import { useEffect, useState } from "react";
import { Sparkles, HelpCircle, Eye, EyeOff } from "lucide-react";

export function WordWeightDebugger({ text, category }: { text: string; category?: string }) {
    const [words, setWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(true); // Toggle debug view -> DEFAULT OPEN MUX

    useEffect(() => {
        if (!show || !text || text.trim().length < 2) return;
        
        const fetchWeights = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/marketplace/word-weights", {
                    method: "POST",
                    body: JSON.stringify({ text, category }),
                    headers: { "Content-Type": "application/json" }
                });
                const data = await res.json();
                if (data.success) {
                    setWords(data.words);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchWeights, 800); // debounce
        return () => clearTimeout(timer);
    }, [text, category, show]);

    if (!show) {
        return (
            <button 
                type="button"
                onClick={() => setShow(true)} 
                className="mt-2 text-[10px] text-gray-500 hover:text-purple-400 flex items-center gap-1"
            >
                <Eye className="w-3 h-3" /> הצג משקלי AI (בדיקות מערכת)
            </button>
        );
    }

    return (
        <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-[#0f0b1a] relative group transition-all">
            <button 
                type="button"
                onClick={() => setShow(false)} 
                className="absolute top-2 left-2 text-gray-500 hover:text-red-400"
            >
                <EyeOff className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-bold text-purple-400 mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> מעבדת לבדיקת משקלי מילים (Hover)
            </h4>
            
            {loading ? (
                <div className="text-xs text-gray-500 animate-pulse">מנתח מילים ואוצר מילים...</div>
            ) : (
                <>
                <div className="text-right leading-8 text-lg text-gray-300" dir="rtl">
                    {words.map((w, i) => {
                        let isHighlighted = false;
                        let colorClass = "";
                        let tooltipText = "";
                        
                        if (w.inDictionary) {
                            isHighlighted = true;
                            
                            const hasAnchor = w.weights.anchor.length > 0;
                            const hasSignal = w.weights.signal.length > 0;
                            const hasCandle = w.weights.dictionary.length > 0;

                            // Color priority: Candle > Signal > Anchor
                            // (ערך מילון מאומת תמיד מקבל סגול, גם אם גם בעוגן)
                            if (hasCandle) {
                                // Candle (נר / ערך מילון) → Purple — עדיפות עליונה
                                colorClass = "bg-purple-900/40 text-purple-200 border-b-2 border-purple-400 cursor-help font-bold";
                            } else if (hasSignal) {
                                // Signal → Emerald/Teal
                                colorClass = "bg-emerald-900/30 text-emerald-300 border-b-2 border-emerald-500 cursor-help font-bold";
                            } else if (hasAnchor) {
                                // Anchor (פנס) → Amber/Orange
                                colorClass = "bg-amber-900/30 text-amber-300 border-b-2 border-amber-500 cursor-help font-bold";
                            } else {
                                // Fallback
                                colorClass = "bg-indigo-600/30 text-indigo-200 border-b-2 border-indigo-500/50 cursor-help font-medium";
                            }
                            
                            tooltipText = `🔍 נמצא במערכת:\n`;
                            
                            w.weights.dictionary.forEach((d: any) => {
                                tooltipText += `• ערך ישיר לשדה [${d.field}]: ${Math.round(d.conf*100)}% השפעה ${d.ignored ? '(מוחרם!)' : ''}\n`;
                            });
                            w.weights.anchor.forEach((a: any) => {
                                tooltipText += `• פנס לשדה [${a.field}]: ${Math.round(a.conf*100)}% השפעה ${a.ignored ? '(מוחרם!)' : ''}\n`;
                            });
                            w.weights.signal.forEach((s: any) => {
                                tooltipText += `• סיגנל עזר לשדה [${s.field}]: ${Math.round(s.weight*100)}% השפעה ${s.ignored ? '(מוחרם!)' : ''}\n`;
                            });
                        }

                        return (
                            <div key={i} className={`relative word-hover-group inline-block ${isHighlighted ? '' : 'mx-[1.5px]'}`}>
                                <span className={`transition-colors rounded-sm px-0.5 ${isHighlighted ? colorClass : 'text-gray-400 hover:text-gray-200'} `}>
                                    {w.word}
                                </span>
                                {/* Tooltip only if highlighted */}
                                {isHighlighted && (
                                    <div className="absolute opacity-0 pointer-events-none 
                                        bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-max max-w-[250px] 
                                        bg-slate-900 border border-slate-700 text-white text-[12px] font-sans rounded-lg p-2.5 
                                        shadow-[0_0_20px_rgba(0,0,0,0.8)] z-[100] whitespace-pre-line text-right leading-tight" dir="rtl">
                                        {tooltipText}
                                    </div>
                                )}
                                {' '}
                            </div>
                        );
                    })}
                </div> {/* End text-right */}

                {/* ── מקרא צבעים ── */}
                <div className="mt-4 pt-3 border-t border-purple-500/20">
                    <div className="text-[10px] text-gray-500 mb-2 font-bold tracking-wider uppercase">מקרא — משמעות הצבעים</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]" dir="rtl">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/70 border-b-2 border-amber-500 shrink-0" />
                            <span className="text-amber-300 font-bold">עוגן (פנס)</span>
                            <span className="text-gray-500">— מילה שמכוונת ל-שדה</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-purple-800/60 border-b-2 border-purple-400 shrink-0" />
                            <span className="text-purple-300 font-bold">נר (ערך מילון)</span>
                            <span className="text-gray-500">— ערך מהמילון הלומד</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-900/50 border-b-2 border-emerald-500 shrink-0" />
                            <span className="text-emerald-300 font-bold">סיגנל</span>
                            <span className="text-gray-500">— אות עזר לשדה (כגון: GB, אינץ׳)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-600/30 border-b-2 border-indigo-500/50 shrink-0" />
                            <span className="text-indigo-300 font-bold">מסווג (כל השאר)</span>
                            <span className="text-gray-500">— מוכר, אבל לא ברור הסוג</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-transparent shrink-0" />
                            <span className="text-gray-500">— (ללא צבע) מילה לא ידועה / לא במילון</span>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-gray-600" dir="rtl">
                        💡 <strong className="text-gray-500">Hover</strong> על מילה צבועה לפירוט המשקל המדויק · מילים ב-(מוחרם!) הוסרו מהשפעה
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                    .word-hover-group:hover > div {
                        opacity: 1 !important;
                    }
                `}} />
            </>
            )}
        </div>
    );
}
