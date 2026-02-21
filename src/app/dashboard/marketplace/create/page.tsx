"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function CreateListingPage() {
    const searchParams = useSearchParams();

    const mode = searchParams.get("mode");
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [testerNote, setTesterNote] = useState("");

    const submitNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (!testerNote.trim()) return;
        await fetch("/api/parser-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: logId || "unknown", testerNote: testerNote.trim() }),
        });
        setTesterNote("");
        setShowNoteModal(false);
        alert("תודה! ההערה נשמרה ✓");
    };

    useEffect(() => {
        console.log("CreateListingPage mounted, mode:", mode);
        if (mode === "smart") {
            const draft = localStorage.getItem("smartListingDraft");
            console.log("Found draft in localStorage:", draft ? "Yes" : "No");

            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    console.log("Parsed draft data:", parsed);

                    if (parsed && typeof parsed === 'object') {
                        setInitialSmartData(parsed);
                        // Clear draft after use to prevent stale data on future loads? 
                        // localStorage.removeItem("smartListingDraft"); 
                    }
                } catch (e) {
                    console.error("Failed to parse smart draft", e);
                }
            }
        }
        setIsLoaded(true);
    }, [mode]);

    // Force re-render if initialSmartData changes
    useEffect(() => {
        if (initialSmartData) {
            console.log("Setting initialSmartData for form:", initialSmartData);
        }
    }, [initialSmartData]);

    // Extract shared data (legacy/query param based)
    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";
    const imagesParam = searchParams.get("images");

    let images: string[] = [];
    if (imagesParam) {
        try {
            images = JSON.parse(imagesParam);
        } catch (e) {
            console.error("Failed to parse images param", e);
        }
    }

    // Clean up URL to prevent 431 Request Header Fields Too Large error on Server Actions
    useEffect(() => {
        if (searchParams.toString().length > 0) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    const sharedData = {
        title: title,
        description: text + (url ? `\n\nSource: ${url}` : ""),
        images: images,
        magicText: text || url || ""
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-black text-white pb-20">
                <Navbar />
                <div className="container mx-auto px-4 pt-8">
                    <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 relative flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-center">
                                {mode === "smart" ? "עריכת מודעה חכמה" : "יצירת מודעה חדשה"}
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
            </div>

            {/* Floating note button — only in smart mode */}
            {mode === "smart" && (
                <button
                    onClick={() => setShowNoteModal(true)}
                    className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-sm font-medium backdrop-blur-md transition-all hover:scale-105 shadow-xl"
                >
                    <MessageSquare className="w-4 h-4" />
                    💬 הוסף הערה
                </button>
            )}

            {/* Note modal */}
            {showNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl" dir="rtl">
                        <h3 className="text-lg font-bold mb-1">💬 הוסף הערה לבודק</h3>
                        <p className="text-sm text-gray-400 mb-4">מה לא היה מדויק בפענוח? תאר בפירוט.</p>
                        <textarea
                            value={testerNote}
                            onChange={e => setTesterNote(e.target.value)}
                            placeholder="לדוגמה: זיהה גלקסי S24 במקום S24 Ultra, המחיר יצא 0, שכח לזהות כי הוא כמו חדש..."
                            rows={5}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40 resize-none"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={submitNote}
                                disabled={!testerNote.trim()}
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
        </>
    );
}
