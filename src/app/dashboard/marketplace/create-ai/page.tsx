"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartListingInput } from "@/components/marketplace/SmartListingInput";
import { ArrowRight, X, Sparkles, MessageSquare, Camera } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import html2canvas from "html2canvas";
import Image from "next/image";

export default function CreateAiPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [pendingLogId, setPendingLogId] = useState<string | null>(null);
    const [testerNote, setTesterNote] = useState("");
    const [testerImageBase64, setTesterImageBase64] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const { user } = useUser();
    const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'אורח' : 'אורח';

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
                        testerName: currentUserName,
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
            // Temporarily hide the note modal itself so it's not in the screenshot
            const modalElement = document.getElementById("ai-note-modal-container");
            if (modalElement) modalElement.style.display = 'none';

            // Allow a small delay for UI to update
            await new Promise(resolve => setTimeout(resolve, 50));

            const canvas = await html2canvas(document.body, {
                useCORS: true,
                scale: 1,
                logging: false,
                ignoreElements: (element) => element.id === "ai-note-modal-container"
            });

            // Restore modal visibility
            if (modalElement) modalElement.style.display = 'flex'; // it uses flex centering

            // Downscale image somewhat to save bandwidth
            const base64Image = canvas.toDataURL("image/jpeg", 0.6);
            setTesterImageBase64(base64Image);
        } catch (error) {
            console.error("Screenshot capture failed:", error);
            alert("שגיאה בצילום המסך, אנא נסה שוב.");
        } finally {
            setIsCapturing(false);
        }
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
                <div id="ai-note-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                            <button
                                onClick={captureScreenshot}
                                disabled={isCapturing}
                                className="w-full mb-3 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-all"
                            >
                                {isCapturing ? "מצלם..." : <><Camera className="w-4 h-4" /> צלם את המסך הנוכחי</>}
                            </button>

                            {testerImageBase64 && (
                                <div className="mb-4 relative group">
                                    <button
                                        onClick={() => setTesterImageBase64(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="הסר תמונה"
                                    >
                                        ×
                                    </button>
                                    <Image src={testerImageBase64} alt="Screenshot preview" className="rounded-lg border border-white/20 w-full object-cover max-h-32"  width={400} height={400}/>
                                </div>
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
