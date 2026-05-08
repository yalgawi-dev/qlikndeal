"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, SendHorizontal } from "lucide-react";
import { WordWeightDebugger } from "./WordWeightDebugger";

interface SmartAiInputProps {
    isAnalyzing?: boolean;
    onResult: (result: any) => void;
    category?: string; // כשמוגדר — הקומפוננט מבצע את קריאת ה-API בעצמה
}

/**
 * SmartAiInput — עובד בשני מצבים:
 * 1. Standalone (create-ai page): category=undefined → מחזיר string גולמי ל-parent
 * 2. Embedded (ListingForm): category מוגדר → קורא /api/analyze ומחזיר אובייקט מפורסר
 */
export function SmartAiInput({ isAnalyzing: externalLoading, onResult, category }: SmartAiInputProps) {
    const [text, setText] = useState("");
    const [internalLoading, setInternalLoading] = useState(false);

    const isLoading = externalLoading || internalLoading;

    const handleButtonClick = async () => {
        if (!text || text.trim().length < 5) return;

        if (category !== undefined) {
            // מצב מוטמע — בתוך ListingForm: קוראים ל-API כאן וישר
            setInternalLoading(true);
            try {
                const response = await fetch("/api/marketplace/analyze", {
                    method: "POST",
                    body: JSON.stringify({ text: text.trim(), category: category }), // ← Category forced here!
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (data.success && data.result) {
                    // יצירת לוג לטובת הלמידה המושהית של הטופס (אחרת הטופס לא ימצא ID ולא יוכל לשלוח תיקונים ללמידה)
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

                    onResult(data.result); // מחזיר אובייקט AI מפורסר
                }
            } catch (e) {
                console.error("SmartAiInput analyze error:", e);
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

            <div className="relative space-y-4">
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="למשל: למכירה אייפון 15 פרו כחול, 256GB, סוללה 100%, מבקש 3800..."
                    className="bg-black/40 border-gray-700 focus:border-indigo-500 min-h-[160px] text-right text-lg text-gray-100 placeholder:text-gray-600 rounded-xl resize-none p-4 pb-16 transition-all"
                    dir="rtl"
                />

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <Button
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