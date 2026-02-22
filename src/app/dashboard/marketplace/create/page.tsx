"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import Image from "next/image";

function CreateListingContent() {
    const searchParams = useSearchParams();

    // Store mode in state so URL cleanup doesn't lose it
    const [mode, setMode] = useState<string | null>(null);
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Tester floating note state
    const { user } = useUser();
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [testerNote, setTesterNote] = useState("");
    const [testerImageBase64, setTesterImageBase64] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        // Capture mode ONCE before URL cleanup removes it
        const m = searchParams.get("mode");
        if (m) {
            setMode(m);
            setIsSmartMode(m === "smart");
        }
        if (m === "smart") {
            const draft = localStorage.getItem("smartListingDraft");
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed && typeof parsed === 'object') {
                        setInitialSmartData(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse smart draft", e);
                }
            }
        }
        setIsLoaded(true);
    }, [searchParams]);

    // Extract shared data (legacy/query param based)
    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";
    const imagesParam = searchParams.get("images");

    let images: string[] = [];
    if (imagesParam) {
        try {
            images = JSON.parse(imagesParam);
        } catch (e) { }
    }

    const sharedData = {
        title: title,
        description: text + (url ? `\n\nSource: ${url}` : ""),
        images: images,
        magicText: text || url || ""
    };

    const submitNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (logId && (testerNote.trim() || testerImageBase64)) {
            const currentUserName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown";
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

            const canvas = await html2canvas(document.body, { useCORS: true, allowTaint: true, windowWidth: document.documentElement.scrollWidth, windowHeight: document.documentElement.scrollHeight });
            const base64Image = canvas.toDataURL('image/jpeg', 0.6);
            setTesterImageBase64(base64Image);

            if (modalElement) modalElement.style.display = 'flex';
        } catch (error) {
            console.error("Screenshot failed:", error);
            alert("צילום המסך נכשל.");
        } finally {
            setIsCapturing(false);
        }
    };

    // Clean up URL to prevent 431 Request Header Fields Too Large error on Server Actions
    useEffect(() => {
        if (searchParams.toString().length > 0) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />
            <div className="container mx-auto px-4 pt-8">
                <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 relative flex items-center justify-center">
                        <h1 className="text-2xl font-bold text-center">
                            {isSmartMode ? "עריכת מודעה חכמה" : "יצירת מודעה חדשה"}
                        </h1>
                        <a
                            href="/dashboard/marketplace"
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-white"
                            title="ביטול וחזרה"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </a>
                    </div>

                    <div className="p-6">
                        <ListingForm
                            key={initialSmartData ? 'smart-loaded' : 'default'}
                            onComplete={() => window.location.href = "/dashboard/marketplace"}
                            onCancel={() => window.location.href = "/dashboard/marketplace"}
                            initialData={initialSmartData || sharedData}
                            initialMagicText={!initialSmartData ? sharedData.magicText : undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Note panel — small floating panel, doesn't block the form */}
            <button
                onClick={() => setShowNoteModal(true)}
                className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-sm font-medium backdrop-blur-md transition-all shadow-xl hover:scale-105"
            >
                <MessageSquare className="w-4 h-4" />
                הוסף הערה
            </button>

            {showNoteModal && (
                <div id="ai-note-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl" dir="rtl">
                        <h3 className="text-lg font-bold mb-1">💬 הוסף הערה לבודק</h3>
                        <p className="text-sm text-gray-400 mb-4">מה לא היה טוב בפענוח ה-AI?</p>
                        <textarea
                            value={testerNote}
                            onChange={(e) => setTesterNote(e.target.value)}
                            placeholder="כמה מילים על מה ה-AI פספס..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40 resize-none min-h-[120px] mb-3"
                            suppressHydrationWarning
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
                                    <Image src={testerImageBase64} alt="Screenshot preview" width={400} height={300} className="rounded-lg border border-white/20 w-full object-cover max-h-32" />
                                </div>
                            )}

                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={submitNote}
                                disabled={!testerNote.trim() && !testerImageBase64}
                                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-sm transition-all"
                            >
                                שמור הערה ✓
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

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
            <CreateListingContent />
        </Suspense>
    );
}
