"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartAiInput } from "@/components/marketplace/SmartAiInput";
import { ArrowRight, X, Sparkles, MessageSquare, Camera } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import html2canvas from "html2canvas";
import Image from "next/image";

export default function CreateAiPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [testerNote, setTesterNote] = useState("");
    const [testerImageBase64, setTesterImageBase64] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const { user } = useUser();
    const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'אורח' : 'אורח';

    const handleAnalyze = async (input: any) => {
        const text = typeof input === 'string' ? input : input?.text || "";
        
        if (!text || text.trim().length < 2) {
            alert("נא להזין טקסט לניתוח");
            return;
        }

        setIsAnalyzing(true);
        
        // --- תיקון 1: ניקוי יסודי של זיכרון ישן לפני שמתחילים ---
        localStorage.removeItem("smartListingDraft");
        localStorage.removeItem("currentParserLogId");

        try {
            console.log("🚨 SENDING REQUEST");
            const response = await fetch("/api/marketplace/analyze", {
                method: "POST",
                body: JSON.stringify({ text: text.trim() }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Analysis failed");

            // --- תיקון 2: וידוא שמירה כאובייקט JSON תקין ---
            const aiResult = data.result || data;
            const resultString = JSON.stringify(aiResult);
            
            localStorage.setItem("smartListingDraft", resultString);
            localStorage.setItem("smartListingOriginalText", text);
            localStorage.setItem("smartListingAiResult", resultString);

            // לוג למערכת הבדיקות
            try {
                const logRes = await fetch("/api/parser-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        originalText: text,
                        aiParsed: resultString,
                        testerName: currentUserName,
                        category: aiResult.category || null,
                        inputMode: "text",
                        sessionId: Date.now().toString(),
                    }),
                });
                const logData = await logRes.json();
                if (logData.id) localStorage.setItem("currentParserLogId", logData.id);
            } catch (e) {
                console.error("Logging failed", e);
            }

            // --- תיקון 3: העברה יציבה לדף היצירה ---
            setTimeout(() => {
                window.location.href = "/dashboard/marketplace/create?mode=smart";
            }, 100);

        } catch (error: any) {
            console.error("Analysis failed:", error);
            alert(error.message || "משהו השתבש בעיבוד הנתונים. נסה שוב.");
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
                    testerImage: testerImageBase64,
                    testerName: currentUserName
                }),
            });
        }
        setTesterNote("");
        setTesterImageBase64(null);
        setShowNoteModal(false);
        alert("תודה! ההערה נשמרה ✓");
    };

    const captureScreenshot = async () => {
        setIsCapturing(true);
        try {
            const modalElement = document.getElementById("ai-note-modal-container");
            if (modalElement) modalElement.style.display = 'none';
            await new Promise(resolve => setTimeout(resolve, 50));
            const canvas = await html2canvas(document.body, { useCORS: true, scale: 1, logging: false });
            if (modalElement) modalElement.style.display = 'flex';
            setTesterImageBase64(canvas.toDataURL("image/jpeg", 0.6));
        } catch (error) {
            console.error("Screenshot failed", error);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            <Link href="/dashboard/marketplace" className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all z-50 backdrop-blur-md border border-white/10">
                <X size={24} />
            </Link>

            <div className="max-w-3xl w-full relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-4 animate-pulse">
                        <Sparkles size={14} />
                        <span>AI Powered Listing</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        מה תרצה למכור היום?
                    </h1>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-1 shadow-2xl border border-white/10">
                    <div className="bg-slate-950/80 rounded-[22px] p-6 md:p-10">
                        <SmartAiInput onResult={handleAnalyze} isAnalyzing={isAnalyzing} />
                    </div>
                </div>
            </div>

            <button onClick={() => setShowNoteModal(true)} className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300">
                <MessageSquare className="w-4 h-4" /> הוסף הערה לבודק
            </button>

            {showNoteModal && (
                <div id="ai-note-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl" dir="rtl">
                        <h3 className="text-lg font-bold mb-4 text-amber-300">💬 הוסף הערה לבודק</h3>
                        <textarea 
                            value={testerNote} 
                            onChange={e => setTesterNote(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mb-3 focus:border-amber-500/50 outline-none" 
                            rows={4}
                            placeholder="מה ה-AI פספס בתיאור שלך?"
                        />
                        <button onClick={captureScreenshot} className="w-full mb-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-2 transition-colors hover:bg-indigo-500/30">
                           <Camera size={16} /> {isCapturing ? "מצלם..." : "צלם מסך"}
                        </button>
                        {testerImageBase64 && (
                            <div className="mb-3 text-xs text-green-400 text-center">✓ צילום מסך צורף בהצלחה</div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={submitNote} className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors">שמור הערה ✓</button>
                            <button onClick={() => setShowNoteModal(false)} className="px-4 py-3 bg-white/10 rounded-xl text-gray-300 hover:bg-white/20 transition-colors">ביטול</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}