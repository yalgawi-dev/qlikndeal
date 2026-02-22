"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartListingInput } from "@/components/marketplace/SmartListingInput";
import { ArrowRight, X, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function CreateAiPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [pendingLogId, setPendingLogId] = useState<string | null>(null);
    const [testerNote, setTesterNote] = useState("");
    const [testerImageBase64, setTesterImageBase64] = useState<string | null>(null);

    // Read tester name from localStorage (set once, persisted)
    const getTesterName = () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("testerName") || "";
    };

    const handleAnalyze = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/marketplace/analyze", {
                method: "POST",
                body: JSON.stringify({ text }),
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();

            // Save to localStorage for the form
            localStorage.setItem("smartListingDraft", JSON.stringify(data));
            // Also save original text for later diff logging
            localStorage.setItem("smartListingOriginalText", text);
            localStorage.setItem("smartListingAiResult", JSON.stringify(data));

            // Log to ParserLog DB
            try {
                const logRes = await fetch("/api/parser-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        originalText: text,
                        aiParsed: JSON.stringify(data),
                        testerName: getTesterName(),
                        category: data.category || null,
                        inputMode: "text",
                        sessionId: Date.now().toString(),
                    }),
                });
                const logData = await logRes.json();
                if (logData.id) localStorage.setItem("currentParserLogId", logData.id);
            } catch {
                // Non-critical: don't block the user if logging fails
            }

            router.push("/dashboard/marketplace/create?mode=smart");

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("משהו השתבש בעיבוד הנתונים. נסה שוב.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const submitNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (logId && (testerNote.trim() || testerImageBase64)) {
            await fetch("/api/parser-log", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: logId,
                    testerNote: testerNote.trim(),
                    testerImage: testerImageBase64
                }),
            });
        }
        setTesterNote("");
        setTesterImageBase64(null);
        setShowNoteModal(false);
        alert("תודה! ההערה נשמרה ✓");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTesterImageBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation / Close Button */}
            <Link
                href="/dashboard/marketplace"
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-gray-300 hover:text-white z-50 backdrop-blur-md border border-white/10"
                title="סגור וחזור ללוח"
            >
                <X size={24} />
            </Link>

            <div className="max-w-3xl w-full relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-4 animate-pulse">
                        <Sparkles size={14} />
                        <span>AI Powered Listing</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight drop-shadow-2xl">
                        מה תרצה למכור היום?
                    </h1>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
                        ספר לנו על המוצר במילים שלך, וה-AI שלנו יהפוך אותו למודעה מושלמת תוך שניות.
                    </p>
                </div>

                {/* Tester name — persisted locally */}
                <div className="mb-4 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="text-gray-400 text-sm whitespace-nowrap">👤 שם הבודק:</span>
                    <input
                        type="text"
                        placeholder="הכנס שמך (נשמר אוטומטית)"
                        defaultValue={typeof window !== "undefined" ? localStorage.getItem("testerName") || "" : ""}
                        onChange={e => {
                            if (typeof window !== "undefined") localStorage.setItem("testerName", e.target.value);
                        }}
                        className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-600"
                    />
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-1 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <div className="bg-slate-950/80 rounded-[22px] p-6 md:p-10">
                        <SmartListingInput
                            onAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>
            </div>

            {/* Floating "הערות" button — always visible for tester */}
            <button
                onClick={() => setShowNoteModal(true)}
                className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-sm font-medium backdrop-blur-md transition-all hover:scale-105 shadow-xl"
            >
                <MessageSquare className="w-4 h-4" />
                הוסף הערה
            </button>

            {/* Note modal */}
            {showNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl" dir="rtl">
                        <h3 className="text-lg font-bold mb-1">💬 הוסף הערה לבודק</h3>
                        <p className="text-sm text-gray-400 mb-4">מה לא היה טוב בפענוח האחרון? תאר בפירוט.</p>
                        <textarea
                            value={testerNote}
                            onChange={e => setTesterNote(e.target.value)}
                            placeholder="לדוגמה: לא זיהה נכון את דגם הטלפון, המחיר יצא 0, נפח האחסון התבלבל..."
                            rows={5}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40 resize-none mb-3"
                            autoFocus
                        />

                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-2">📸 צרף צילום מסך (אופציונלי):</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-xs text-slate-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-xs file:font-semibold
                                  file:bg-amber-500/10 file:text-amber-400
                                  hover:file:bg-amber-500/20"
                            />
                            {testerImageBase64 && (
                                <img src={testerImageBase64} alt="Preview" className="mt-2 max-h-32 rounded border border-white/10 object-contain" />
                            )}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={submitNote}
                                disabled={!testerNote.trim() && !testerImageBase64}
                                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-sm transition-all"
                            >
                                שמור הערה
                            </button>
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-all"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
